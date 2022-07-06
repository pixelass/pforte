var $2bvbz$nodeprocess = require("node:process");
var $2bvbz$pforteconstants = require("@pforte/constants");
var $2bvbz$axios = require("axios");

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "default", () => $aa3dc54692ea4fa8$export$2e2bcd8739ae039);



function $aa3dc54692ea4fa8$export$2e2bcd8739ae039(config) {
    const host = (0, ($parcel$interopDefault($2bvbz$nodeprocess))).env.PFORTE_URL || (0, ($parcel$interopDefault($2bvbz$nodeprocess))).env.VERCEL_URL || "http://localhost:3000";
    const redirectUri = [
        host,
        (0, $2bvbz$pforteconstants.GITHUB_PATH)
    ].join("/");
    const { clientId: clientId , clientSecret: clientSecret  } = config;
    return {
        url: `https://github.com/login/oauth/authorize?scope=user&client_id=${clientId}&redirect_uri=${redirectUri}`,
        name: "github",
        async connect ({ request: request  }) {
            // Get access token
            const { data: accessToken  } = await (0, ($parcel$interopDefault($2bvbz$axios))).post("https://github.com/login/oauth/access_token", {}, {
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
            const { data: user  } = await (0, ($parcel$interopDefault($2bvbz$axios))).get("https://api.github.com/user", {
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


//# sourceMappingURL=index.js.map
