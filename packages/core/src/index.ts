import type { IncomingMessage, ServerResponse } from "http";
import process from "node:process";

import {
	AUTH_CSRF_COOKIE,
	AUTH_SESSION_COOKIE,
	CALLBACK_PATH,
	DEFAULT_MAX_AGE,
} from "@pforte/constants";
import { getExpirationDate } from "@pforte/utils";
import { CookieSerializeOptions, serialize } from "cookie";
import { nanoid } from "nanoid";

import createCSRFToken from "./csrf-token";

export type MaybeArray<T> = T | T[];

/**
 * Send body of response
 */
type Send<T> = (body: T) => void;
/**
 * Next `API` route request
 */
export interface ApiRequest extends IncomingMessage {
	/**
	 * Object of `query` values from url
	 */
	query: Partial<{
		[key: string]: string | string[];
	}>;
	/**
	 * Object of `cookies` from header
	 */
	cookies: Partial<{
		[key: string]: string;
	}>;

	body: any;
}

/**
 * Next `API` route response
 */
export type ApiResponse<T = any> = ServerResponse & {
	/**
	 * Send data `any` data in response
	 */
	send: Send<T>;
	/**
	 * Send data `json` data in response
	 */
	json: Send<T>;
	status: (statusCode: number) => ApiResponse<T>;
};

/**
 * Next `API` route handler
 */
export type ApiHandler<T = any> = (
	req: ApiRequest,
	res: ApiResponse<T>
) => unknown | Promise<unknown>;

interface User {
	_id: string;
	name: string;
	email: string | null;
	image: string | null;
}

interface Provider {
	url: string;
	name: string;
	connect({ request: ApiRequest }): Promise<{ accessToken: string; user: User }>;
}

interface Adapter {
	(name: "session", payload: any): Promise<User>;
	(name: "user", payload: any): Promise<unknown>;
}

export interface CookieConfig {
	name: string;
	value: string;
	options: CookieSerializeOptions;
}

/**
 * Copied from https://github.com/nextauthjs/next-auth/blob/2469e44572f23f709fa8c5c65c6b7a4eb2383e9f/packages/next-auth/src/next/utils.ts
 */
export function setCookie(response: ApiResponse, cookie: CookieConfig) {
	// Preserve any existing cookies that have already been set in the same session
	let setCookieHeader: MaybeArray<string | number> = response.getHeader("Set-Cookie") ?? [];
	// If not an array (i.e. a string with a single cookie) convert to array
	if (!Array.isArray(setCookieHeader)) {
		setCookieHeader = [setCookieHeader];
	}
	const { name, value, options } = cookie;
	const cookieHeader = serialize(name, value, options);

	setCookieHeader.push(cookieHeader);
	response.setHeader(
		"Set-Cookie",
		setCookieHeader.map(item => `${item}`)
	);
}

export function extendHandler({
	request,
	response,
	maxAge,
}: {
	request: ApiRequest;
	response: ApiResponse;
	maxAge: number;
}) {
	const cookies = Object.entries(request.cookies ?? {}).map(
		([name, value]: [string, string]) => ({
			name,
			value,
			options: {},
		})
	);
	const sessionToken = nanoid();
	const csrfToken = createCSRFToken({
		options: { secret: process.env.PFORTE_SECRET || "pforte-secret" },
		isPost: false,
	});
	const expires = getExpirationDate(maxAge);
	cookies.push(
		{
			name: AUTH_SESSION_COOKIE,
			value: sessionToken,
			options: {
				path: "/",
				secure: process.env.NODE_ENV === "production",
				httpOnly: process.env.NODE_ENV === "production",
				hostOnly: process.env.NODE_ENV === "production",
				sameSite: "Lax",
				expires,
			},
		},
		{
			name: AUTH_CSRF_COOKIE,
			value: csrfToken.cookie,
			options: {
				path: "/",
				secure: process.env.NODE_ENV === "production",
				httpOnly: process.env.NODE_ENV === "production",
				hostOnly: process.env.NODE_ENV === "production",
				sameSite: "Lax",
			},
		}
	);
	cookies.forEach(cookie => setCookie(response, cookie));
	return { sessionToken, csrfToken, expires };
}

export async function handleSession({ request }: { request: ApiRequest }, adapter: Adapter) {
	if (adapter) {
		const cookieValue: string = request.cookies[AUTH_CSRF_COOKIE];
		const { sessionToken, csrfToken } = request.body;
		const [bodyValue] = csrfToken.split("|");
		const { csrfTokenVerified } = createCSRFToken({
			options: { secret: process.env.PFORTE_SECRET || "pforte-secret" },
			isPost: true,
			cookieValue,
			bodyValue,
		});

		return csrfTokenVerified ? await adapter("session", { sessionToken, csrfToken }) : null;
	} else {
		return null;
	}
}

export function handleSignOut({ response }: { response: ApiResponse }) {
	setCookie(response, {
		name: AUTH_SESSION_COOKIE,
		value: "",
		options: {
			path: "/",
			expires: getExpirationDate(0),
		},
	});
	setCookie(response, {
		name: AUTH_CSRF_COOKIE,
		value: "",
		options: {
			path: "/",
			expires: getExpirationDate(0),
		},
	});
}

export default function pforte({
	adapter,
	providers,
	maxAge = DEFAULT_MAX_AGE,
}: {
	adapter: Adapter;
	providers: Provider[];
	maxAge?: number;
}): ApiHandler {
	const host = process.env.PFORTE_URL || process.env.VERCEL_URL || "http://localhost:3000";
	const callbackPath = [host, CALLBACK_PATH].join("/");

	return async function pforteHandler(request, response) {
		const { query, method } = request;
		switch (query.pforte) {
			case "session":
				if (method === "POST") {
					await handleSession({ request }, adapter).then(user => {
						response.status(200).json({
							success: true,
							data: user
								? {
										user: {
											id: user._id,
											name: user.name,
											email: user.email,
											image: user.image,
										},
								  }
								: null,
						});
					});
				} else {
					response.status(404).send("Not Found");
				}
				break;
			case "signin":
				response.status(200).json({
					url: providers.find(provider_ => provider_.name === query.provider).url,
				});
				break;
			case "signout":
				handleSignOut({ response });
				response.status(302).setHeader("Location", callbackPath).end();
				break;
			case "callback":
				response.status(302).setHeader("Location", host).end();
				break;
			case "github":
				try {
					const provider = providers.find(provider_ => provider_.name === "github");
					await provider
						.connect({ request })
						.then(({ user, accessToken }) => {
							if (adapter) {
								const { sessionToken, csrfToken } = extendHandler({
									request,
									response,
									maxAge,
								});
								return adapter("user", {
									user,
									accessToken,
									sessionToken,
									csrfToken,
									maxAge,
								});
							}
						})
						.then(() => {
							response.status(302).setHeader("Location", callbackPath).end();
						})
						.catch(error => {
							response.status(error.response.status).send(error.message);
						});
				} catch (error) {
					response.status(error.response.status).send(error.message);
				}
				break;
			default:
				response.status(404).send("Not Found");
				break;
		}
	};
}
