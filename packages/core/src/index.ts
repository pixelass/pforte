import process from "node:process";

import {
	AUTH_CSRF_COOKIE,
	AUTH_SESSION_COOKIE,
	CALLBACK_PATH,
	DEFAULT_MAX_AGE,
} from "@pforte/constants";
import { getExpirationDate } from "@pforte/utils";
import { serialize } from "cookie";
import { nanoid } from "nanoid";

import createCSRFToken from "./csrf-token";

export function setCookie(response, cookie) {
	// Preserve any existing cookies that have already been set in the same session
	let setCookieHeader = response.getHeader("Set-Cookie") ?? [];
	// If not an array (i.e. a string with a single cookie) convert to array
	if (!Array.isArray(setCookieHeader)) {
		setCookieHeader = [setCookieHeader];
	}
	const { name, value, options } = cookie;
	const cookieHeader = serialize(name, value, options);

	setCookieHeader.push(cookieHeader);
	response.setHeader("Set-Cookie", setCookieHeader);
}

export function extendHandler({ request, response, maxAge }) {
	const cookies = Object.entries(request.cookies ?? {}).map(([name, value]) => ({
		name,
		value,
		options: {},
	}));
	const sessionToken = nanoid();
	const csrfToken = createCSRFToken({
		options: { secret: process.env.PFORTE_SECRET || "pforte-secret" },
		isPost: false,
	});
	const expires = getExpirationDate(maxAge);
	cookies.push({
		name: AUTH_SESSION_COOKIE,
		value: sessionToken,
		options: {
			path: "/",
			expires,
		},
	});
	cookies.push({
		name: AUTH_CSRF_COOKIE,
		value: csrfToken.cookie,
		options: {
			path: "/",
			expires,
		},
	});
	cookies.forEach(cookie => setCookie(response, cookie));
	return { sessionToken, csrfToken, expires };
}

export async function handleSession({ request }, adapter) {
	if (adapter) {
		const csrfTokenCookie = request.cookies[AUTH_CSRF_COOKIE]
		const { sessionToken, csrfToken } = request.body;
		const [bodyValue] = csrfToken.split("|");
		const { csrfTokenVerified } = createCSRFToken({
			options: { secret: process.env.PFORTE_SECRET || "pforte-secret" },
			isPost: true,
			cookieValue: csrfTokenCookie,
			bodyValue,
		});

		return csrfTokenVerified ? await adapter("session", { sessionToken, csrfToken }) : null;
	} else {
		return null;
	}
}

export function handleSignOut({ response }) {
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

export default function pforte({ adapter, providers, maxAge = DEFAULT_MAX_AGE }) {
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
							console.error(error);
							//response.status(error.response.status).send(error.message);
						});
				} catch (error) {
					console.error(error);
				}
				break;
			default:
				response.status(404).send("Not Found");
				break;
		}
	};
}
