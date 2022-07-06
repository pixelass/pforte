import {AUTH_SESSION_COOKIE as $92sTm$AUTH_SESSION_COOKIE, AUTH_CSRF_COOKIE as $92sTm$AUTH_CSRF_COOKIE, SESSION_PATH as $92sTm$SESSION_PATH, SIGNIN_PATH as $92sTm$SIGNIN_PATH, SIGNOUT_PATH as $92sTm$SIGNOUT_PATH} from "@pforte/constants";
import $92sTm$axios from "axios";
import $92sTm$jscookie from "js-cookie";




async function $04cc7ea95fc7412c$export$12151e9ef3722552() {
    const sessionToken = (0, $92sTm$jscookie).get((0, $92sTm$AUTH_SESSION_COOKIE));
    if (sessionToken) {
        const csrfToken = (0, $92sTm$jscookie).get((0, $92sTm$AUTH_CSRF_COOKIE));
        try {
            const { data: data  } = await (0, $92sTm$axios).post(`/${(0, $92sTm$SESSION_PATH)}`, {
                sessionToken: sessionToken,
                csrfToken: csrfToken
            });
            return data.data;
        } catch (error) {
            return null;
        }
    }
    return null;
}
async function $04cc7ea95fc7412c$export$9670d83f11d4b64a(provider) {
    const session = await $04cc7ea95fc7412c$export$12151e9ef3722552();
    if (!session) try {
        const { data: data  } = await (0, $92sTm$axios).get(`/${(0, $92sTm$SIGNIN_PATH)}`, {
            params: {
                provider: provider
            }
        });
        window.location.href = data.url;
        if (data.url.includes("#")) window.location.reload();
    } catch (error) {
        console.error(error);
    }
}
async function $04cc7ea95fc7412c$export$b0ac3a1c242cb1ea() {
    window.location.pathname = `/${0, $92sTm$SIGNOUT_PATH}`;
}


export {$04cc7ea95fc7412c$export$12151e9ef3722552 as getSession, $04cc7ea95fc7412c$export$9670d83f11d4b64a as signIn, $04cc7ea95fc7412c$export$b0ac3a1c242cb1ea as signOut};
//# sourceMappingURL=index.js.map
