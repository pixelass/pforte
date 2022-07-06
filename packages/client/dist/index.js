var $cZxnN$pforteconstants = require("@pforte/constants");
var $cZxnN$axios = require("axios");
var $cZxnN$jscookie = require("js-cookie");

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "getSession", () => $47aff3fd391083fe$export$12151e9ef3722552);
$parcel$export(module.exports, "signIn", () => $47aff3fd391083fe$export$9670d83f11d4b64a);
$parcel$export(module.exports, "signOut", () => $47aff3fd391083fe$export$b0ac3a1c242cb1ea);



async function $47aff3fd391083fe$export$12151e9ef3722552() {
    const sessionToken = (0, ($parcel$interopDefault($cZxnN$jscookie))).get((0, $cZxnN$pforteconstants.AUTH_SESSION_COOKIE));
    if (sessionToken) {
        const csrfToken = (0, ($parcel$interopDefault($cZxnN$jscookie))).get((0, $cZxnN$pforteconstants.AUTH_CSRF_COOKIE));
        try {
            const { data: data  } = await (0, ($parcel$interopDefault($cZxnN$axios))).post(`/${(0, $cZxnN$pforteconstants.SESSION_PATH)}`, {
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
async function $47aff3fd391083fe$export$9670d83f11d4b64a(provider) {
    const session = await $47aff3fd391083fe$export$12151e9ef3722552();
    if (!session) try {
        const { data: data  } = await (0, ($parcel$interopDefault($cZxnN$axios))).get(`/${(0, $cZxnN$pforteconstants.SIGNIN_PATH)}`, {
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
async function $47aff3fd391083fe$export$b0ac3a1c242cb1ea() {
    window.location.pathname = `/${0, $cZxnN$pforteconstants.SIGNOUT_PATH}`;
}


//# sourceMappingURL=index.js.map
