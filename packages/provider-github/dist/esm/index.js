import $aav4i$nodeprocess from "node:process";
import {GITHUB_PATH as $aav4i$GITHUB_PATH} from "@pforte/constants";
import $aav4i$axios from "axios";




function $c5b0f7f236efdab2$export$2e2bcd8739ae039(config) {
    const host = (0, $aav4i$nodeprocess).env.PFORTE_URL || (0, $aav4i$nodeprocess).env.VERCEL_URL || "http://localhost:3000";
    const redirectUri = [
        host,
        (0, $aav4i$GITHUB_PATH)
    ].join("/");
    const { clientId: clientId , clientSecret: clientSecret  } = config;
    return {
        url: `https://github.com/login/oauth/authorize?scope=user&client_id=${clientId}&redirect_uri=${redirectUri}`,
        name: "github",
        async connect ({ request: request  }) {
            // Get access token
            const { data: accessToken  } = await (0, $aav4i$axios).post("https://github.com/login/oauth/access_token", {}, {
                params: {
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: redirectUri,
                    code: request.query.code
                },
                headers: {
                    Accept: "application/json"
                }
            });
            // Get user with access token
            const { data: user  } = await (0, $aav4i$axios).get("https://api.github.com/user", {
                headers: {
                    Authorization: `token ${accessToken.access_token}`
                }
            });
            return {
                user: user,
                accessToken: accessToken
            };
        }
    };
}


export {$c5b0f7f236efdab2$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=index.js.map
