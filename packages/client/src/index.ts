import {
	AUTH_CSRF_COOKIE,
	AUTH_SESSION_COOKIE,
	SESSION_PATH,
	SIGNIN_PATH,
	SIGNOUT_PATH,
} from "@pforte/constants";
import axios from "axios";
import Cookies from "js-cookie";

/**
 * User model
 */
export interface User {
	id: string;
	name: string;
	email: string | null;
	image: string | null;
}

export interface ResponseObject<T> {
	success: boolean;
	data: T;
}

/**
 * Get an active session
 * Requires a session-token and csrf-token
 */
export async function getSession(): Promise<{ user: User } | null> {
	const sessionToken = Cookies.get(AUTH_SESSION_COOKIE);
	if (sessionToken) {
		const csrfToken = Cookies.get(AUTH_CSRF_COOKIE);
		try {
			const { data } = await axios.post<ResponseObject<{ user: User }>>(`/${SESSION_PATH}`, {
				sessionToken,
				csrfToken,
			});
			return data.data;
		} catch (error) {
			return null;
		}
	}
	return null;
}

/**
 * Sign in the user
 *
 * @param provider
 */
export async function signIn(provider: string) {
	// Check for an existing session
	const session = await getSession();
	if (!session) {
		// When there is no session, then we need to authenticate via a provider
		try {
			// Get the URL and navigate there
			const { data } = await axios.get<{ url: string }>(`/${SIGNIN_PATH}`, {
				params: { provider },
			});
			window.location.href = data.url;

			// Force reload if the url contains a hash
			if (data.url.includes("#")) {
				window.location.reload();
			}
		} catch (error) {
			console.error(error);
		}
	}
}

/**
 * Sign out the user
 */
export async function signOut() {
	window.location.pathname = `/${SIGNOUT_PATH}`;
}
