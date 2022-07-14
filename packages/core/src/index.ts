import type { IncomingMessage, ServerResponse } from "node:http";
import process from "node:process";

import { Adapter, SessionAdapter, UserAdapter } from "@pforte/adapter-mongoose";
import {
	AUTH_CSRF_COOKIE,
	AUTH_SESSION_COOKIE,
	CALLBACK_PATH,
	DEFAULT_MAX_AGE,
} from "@pforte/constants";
import { Provider } from "@pforte/provider-github";
import { getExpirationDate } from "@pforte/utils";
import { CookieSerializeOptions, serialize } from "cookie";
import { nanoid } from "nanoid";

import createCSRFToken from "./csrf-token";

/**
 * Array or item helper
 */
export type MaybeArray<T> = T | T[];

/**
 * Send body of response
 */
export type Send<T> = (body: T) => void;

interface ParsedQs {
	[key: string]: undefined | string | string[] | ParsedQs | ParsedQs[];
}

/**
 * Next `API` route request
 */
export interface ApiRequest extends IncomingMessage {
	/**
	 * Object of `query` values from url
	 */
	query: ParsedQs;
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
 * `API` route handler
 */
export type ApiHandler<T = any> = (
	req: ApiRequest,
	res: ApiResponse<T>
) => unknown | Promise<unknown>;

/**
 * Mongodb User model
 */
export interface User {
	_id: string;
	name: string;
	email: string | null;
	image: string | null;
}

/**
 * Configuration for cookies
 */
export interface CookieConfig {
	name: string;
	value: string;
	options: CookieSerializeOptions;
}

/**
 * Copied from https://github.com/nextauthjs/next-auth/blob/2469e44572f23f709fa8c5c65c6b7a4eb2383e9f/packages/next-auth/src/next/utils.ts
 *
 * @param response
 * @param cookie
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

/**
 * Extends the handler with new cookies.
 * Creates a Session cookie and a CSRF cookie
 *
 * @param request
 * @param response
 * @param maxAge
 */
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
				httpOnly: false,
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
				httpOnly: false,
				sameSite: "Lax",
			},
		}
	);
	cookies.forEach(cookie => setCookie(response, cookie));
	return { sessionToken, csrfToken, expires };
}

/**
 * Handle the session request
 *
 * @param request
 * @param adapter
 */
export async function handleSession({ request }: { request: ApiRequest }, adapter: Adapter) {
	// Sessions require an adapter
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

		// Only use the adapter when the token is verified
		return csrfTokenVerified
			? await (adapter as SessionAdapter)("session", { sessionToken })
			: null;
	} else {
		return null;
	}
}

/**
 * Handle the sign-out request
 * Expires the Session cookie and the CSRF cookie
 *
 * @param response
 */
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

/**
 * A factory that provides an auth handler.
 *
 * @param adapter
 * @param providers
 * @param maxAge
 */
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
				// Session requests require a post since we want to verify the request
				if (method === "POST") {
					await handleSession({ request }, adapter).then(user => {
						response.status(200).json({
							success: true,
							data: user
								? {
										user: {
											id: user.id,
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
				// Signin requests are responded with the auth url of the provider
				response.status(200).json({
					url: providers.find(provider_ => provider_.name === query.provider).url,
				});
				break;
			case "signout":
				// Sign-out expires cookies and forces a page reload
				handleSignOut({ response });
				response.status(302).setHeader("Location", callbackPath).end();
				break;
			case "callback":
				// Redirect to the host
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
								return (adapter as UserAdapter)("user", {
									user,
									accessToken,
									sessionToken,
									csrfToken: csrfToken.csrfToken,
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
