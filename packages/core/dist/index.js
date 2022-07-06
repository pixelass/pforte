var $EmB27$nodeprocess = require("node:process");
var $EmB27$pforteconstants = require("@pforte/constants");
var $EmB27$pforteutils = require("@pforte/utils");
var $EmB27$cookie = require("cookie");
var $EmB27$nanoid = require("nanoid");
var $EmB27$nodecrypto = require("node:crypto");

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

$parcel$export(module.exports, "setCookie", () => $97fa460fd06a9361$export$110700823644f4a6);
$parcel$export(module.exports, "extendHandler", () => $97fa460fd06a9361$export$b302b4f64c29c57f);
$parcel$export(module.exports, "handleSession", () => $97fa460fd06a9361$export$aab00477cefa4d42);
$parcel$export(module.exports, "handleSignOut", () => $97fa460fd06a9361$export$ceee541d50ede9fc);
$parcel$export(module.exports, "default", () => $97fa460fd06a9361$export$2e2bcd8739ae039);






function $ac9a7c5437212968$export$2e2bcd8739ae039({ options: options , cookieValue: cookieValue , isPost: isPost , bodyValue: bodyValue  }) {
    if (cookieValue) {
        const [csrfToken, csrfTokenHash] = cookieValue.split("|");
        const expectedCsrfTokenHash = (0, $EmB27$nodecrypto.createHash)("sha256").update(`${csrfToken}${options.secret}`).digest("hex");
        if (csrfTokenHash === expectedCsrfTokenHash) {
            // If hash matches then we trust the CSRF token value
            // If this is a POST request and the CSRF Token in the POST request matches
            // the cookie we have already verified is the one we have set, then the token is verified!
            const csrfTokenVerified = isPost && csrfToken === bodyValue;
            return {
                csrfTokenVerified: csrfTokenVerified,
                csrfToken: csrfToken
            };
        }
    }
    // New CSRF token
    const csrfToken = (0, $EmB27$nodecrypto.randomBytes)(32).toString("hex");
    const csrfTokenHash = (0, $EmB27$nodecrypto.createHash)("sha256").update(`${csrfToken}${options.secret}`).digest("hex");
    const cookie = `${csrfToken}|${csrfTokenHash}`;
    return {
        cookie: cookie,
        csrfToken: csrfToken
    };
}


function $97fa460fd06a9361$export$110700823644f4a6(response, cookie) {
    // Preserve any existing cookies that have already been set in the same session
    let setCookieHeader = response.getHeader("Set-Cookie") ?? [];
    // If not an array (i.e. a string with a single cookie) convert to array
    if (!Array.isArray(setCookieHeader)) setCookieHeader = [
        setCookieHeader
    ];
    const { name: name , value: value , options: options  } = cookie;
    const cookieHeader = (0, $EmB27$cookie.serialize)(name, value, options);
    setCookieHeader.push(cookieHeader);
    response.setHeader("Set-Cookie", setCookieHeader);
}
function $97fa460fd06a9361$export$b302b4f64c29c57f({ request: request , response: response , maxAge: maxAge  }) {
    const cookies = Object.entries(request.cookies).map(([name, value])=>({
            name: name,
            value: value,
            options: {}
        }));
    const sessionToken = (0, $EmB27$nanoid.nanoid)();
    const csrfToken = (0, $ac9a7c5437212968$export$2e2bcd8739ae039)({
        options: {
            secret: (0, ($parcel$interopDefault($EmB27$nodeprocess))).env.PFORTE_SECRET || "pforte-secret"
        },
        isPost: false
    });
    const expires = (0, $EmB27$pforteutils.getExpirationDate)(maxAge);
    cookies.push({
        name: (0, $EmB27$pforteconstants.AUTH_SESSION_COOKIE),
        value: sessionToken,
        options: {
            path: "/",
            expires: expires
        }
    });
    cookies.push({
        name: (0, $EmB27$pforteconstants.AUTH_CSRF_COOKIE),
        value: csrfToken.cookie,
        options: {
            path: "/",
            expires: expires
        }
    });
    cookies.forEach((cookie)=>$97fa460fd06a9361$export$110700823644f4a6(response, cookie));
    return {
        sessionToken: sessionToken,
        csrfToken: csrfToken,
        expires: expires
    };
}
async function $97fa460fd06a9361$export$aab00477cefa4d42({ request: request  }, adapter) {
    if (adapter) {
        const { sessionToken: sessionToken , csrfToken: csrfToken  } = request.body;
        const [bodyValue] = csrfToken.split("|");
        const { csrfTokenVerified: csrfTokenVerified  } = (0, $ac9a7c5437212968$export$2e2bcd8739ae039)({
            options: {
                secret: (0, ($parcel$interopDefault($EmB27$nodeprocess))).env.PFORTE_SECRET || "pforte-secret"
            },
            isPost: true,
            cookieValue: csrfToken,
            bodyValue: bodyValue
        });
        return csrfTokenVerified ? await adapter("session", {
            sessionToken: sessionToken,
            csrfToken: csrfToken
        }) : null;
    } else return null;
}
function $97fa460fd06a9361$export$ceee541d50ede9fc({ response: response  }) {
    $97fa460fd06a9361$export$110700823644f4a6(response, {
        name: (0, $EmB27$pforteconstants.AUTH_SESSION_COOKIE),
        value: "",
        options: {
            path: "/",
            expires: (0, $EmB27$pforteutils.getExpirationDate)(0)
        }
    });
    $97fa460fd06a9361$export$110700823644f4a6(response, {
        name: (0, $EmB27$pforteconstants.AUTH_CSRF_COOKIE),
        value: "",
        options: {
            path: "/",
            expires: (0, $EmB27$pforteutils.getExpirationDate)(0)
        }
    });
}
function $97fa460fd06a9361$export$2e2bcd8739ae039({ adapter: adapter , providers: providers , maxAge: maxAge = (0, $EmB27$pforteconstants.DEFAULT_MAX_AGE)  }) {
    const host = (0, ($parcel$interopDefault($EmB27$nodeprocess))).env.PFORTE_URL || (0, ($parcel$interopDefault($EmB27$nodeprocess))).env.VERCEL_URL || "http://localhost:3000";
    const callbackPath = [
        host,
        (0, $EmB27$pforteconstants.CALLBACK_PATH)
    ].join("/");
    return async function pforteHandler(request, response) {
        const { query: query  } = request;
        switch(query.pforte){
            case "session":
                await $97fa460fd06a9361$export$aab00477cefa4d42({
                    request: request
                }, adapter).then((user)=>{
                    response.status(200).json({
                        success: true,
                        data: user ? {
                            user: {
                                id: user._id,
                                name: user.name,
                                email: user.email,
                                image: user.image
                            }
                        } : null
                    });
                });
                break;
            case "signin":
                response.status(200).json({
                    url: providers.find((provider_)=>provider_.name === query.provider).url
                });
                break;
            case "signout":
                $97fa460fd06a9361$export$ceee541d50ede9fc({
                    response: response
                });
                response.status(302).setHeader("Location", callbackPath).end();
                break;
            case "callback":
                response.status(302).setHeader("Location", host).end();
                break;
            case "github":
                try {
                    const provider = providers.find((provider_)=>provider_.name === "github");
                    await provider.connect({
                        request: request
                    }).then(({ user: user , accessToken: accessToken  })=>{
                        if (adapter) {
                            const { sessionToken: sessionToken , csrfToken: csrfToken  } = $97fa460fd06a9361$export$b302b4f64c29c57f({
                                request: request,
                                response: response,
                                maxAge: maxAge
                            });
                            return adapter("user", {
                                user: user,
                                accessToken: accessToken,
                                sessionToken: sessionToken,
                                csrfToken: csrfToken,
                                maxAge: maxAge
                            });
                        }
                    }).then(()=>{
                        response.status(302).setHeader("Location", callbackPath).end();
                    }).catch((error)=>{
                        response.status(error.response.status).send(error.message);
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


//# sourceMappingURL=index.js.map
