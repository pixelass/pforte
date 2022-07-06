import {
	AUTH_CSRF_COOKIE,
	AUTH_SESSION_COOKIE,
	SESSION_PATH,
	SIGNIN_PATH,
	SIGNOUT_PATH,
} from "@pforte/constants";
import axios from "axios";
import Cookies from "js-cookie";

export async function getSession() {
	const sessionToken = Cookies.get(AUTH_SESSION_COOKIE);
	if (sessionToken) {
		const csrfToken = Cookies.get(AUTH_CSRF_COOKIE);
		try {
			const { data } = await axios.post(`/${SESSION_PATH}`, {
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

export async function signIn(provider) {
	const session = await getSession();
	if (!session) {
		try {
			const { data } = await axios.get(`/${SIGNIN_PATH}`, { params: { provider } });
			window.location.href = data.url;
			if (data.url.includes("#")) {
				window.location.reload();
			}
		} catch (error) {
			console.error(error);
		}
	}
}

export async function signOut() {
	window.location.pathname = `/${SIGNOUT_PATH}`;
}
