import $gCIUE$nodeprocess from "node:process";
import {AUTH_SESSION_COOKIE as $gCIUE$AUTH_SESSION_COOKIE, AUTH_CSRF_COOKIE as $gCIUE$AUTH_CSRF_COOKIE, DEFAULT_MAX_AGE as $gCIUE$DEFAULT_MAX_AGE, CALLBACK_PATH as $gCIUE$CALLBACK_PATH} from "@pforte/constants";
import {getExpirationDate as $gCIUE$getExpirationDate} from "@pforte/utils";
import {serialize as $gCIUE$serialize} from "cookie";
import {nanoid as $gCIUE$nanoid} from "nanoid";
import {createHash as $gCIUE$createHash, randomBytes as $gCIUE$randomBytes} from "node:crypto";







function $b268da144467c8ef$export$2e2bcd8739ae039({ options: options , cookieValue: cookieValue , isPost: isPost , bodyValue: bodyValue  }) {
    if (cookieValue) {
        const [csrfToken, csrfTokenHash] = cookieValue.split("|");
        const expectedCsrfTokenHash = (0, $gCIUE$createHash)("sha256").update(`${csrfToken}${options.secret}`).digest("hex");
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
    const csrfToken = (0, $gCIUE$randomBytes)(32).toString("hex");
    const csrfTokenHash = (0, $gCIUE$createHash)("sha256").update(`${csrfToken}${options.secret}`).digest("hex");
    const cookie = `${csrfToken}|${csrfTokenHash}`;
    return {
        cookie: cookie,
        csrfToken: csrfToken
    };
}


function $841517d9877cb419$export$110700823644f4a6(response, cookie) {
    // Preserve any existing cookies that have already been set in the same session
    let setCookieHeader = response.getHeader("Set-Cookie") ?? [];
    // If not an array (i.e. a string with a single cookie) convert to array
    if (!Array.isArray(setCookieHeader)) setCookieHeader = [
        setCookieHeader
    ];
    const { name: name , value: value , options: options  } = cookie;
    const cookieHeader = (0, $gCIUE$serialize)(name, value, options);
    setCookieHeader.push(cookieHeader);
    response.setHeader("Set-Cookie", setCookieHeader);
}
function $841517d9877cb419$export$b302b4f64c29c57f({ request: request , response: response , maxAge: maxAge  }) {
    const cookies = Object.entries(request.cookies).map(([name, value])=>({
            name: name,
            value: value,
            options: {}
        }));
    const sessionToken = (0, $gCIUE$nanoid)();
    const csrfToken = (0, $b268da144467c8ef$export$2e2bcd8739ae039)({
        options: {
            secret: (0, $gCIUE$nodeprocess).env.PFORTE_SECRET || "pforte-secret"
        },
        isPost: false
    });
    const expires = (0, $gCIUE$getExpirationDate)(maxAge);
    cookies.push({
        name: (0, $gCIUE$AUTH_SESSION_COOKIE),
        value: sessionToken,
        options: {
            path: "/",
            expires: expires
        }
    });
    cookies.push({
        name: (0, $gCIUE$AUTH_CSRF_COOKIE),
        value: csrfToken.cookie,
        options: {
            path: "/",
            expires: expires
        }
    });
    cookies.forEach((cookie)=>$841517d9877cb419$export$110700823644f4a6(response, cookie));
    return {
        sessionToken: sessionToken,
        csrfToken: csrfToken,
        expires: expires
    };
}
async function $841517d9877cb419$export$aab00477cefa4d42({ request: request  }, adapter) {
    if (adapter) {
        const { sessionToken: sessionToken , csrfToken: csrfToken  } = request.body;
        const [bodyValue] = csrfToken.split("|");
        const { csrfTokenVerified: csrfTokenVerified  } = (0, $b268da144467c8ef$export$2e2bcd8739ae039)({
            options: {
                secret: (0, $gCIUE$nodeprocess).env.PFORTE_SECRET || "pforte-secret"
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
function $841517d9877cb419$export$ceee541d50ede9fc({ response: response  }) {
    $841517d9877cb419$export$110700823644f4a6(response, {
        name: (0, $gCIUE$AUTH_SESSION_COOKIE),
        value: "",
        options: {
            path: "/",
            expires: (0, $gCIUE$getExpirationDate)(0)
        }
    });
    $841517d9877cb419$export$110700823644f4a6(response, {
        name: (0, $gCIUE$AUTH_CSRF_COOKIE),
        value: "",
        options: {
            path: "/",
            expires: (0, $gCIUE$getExpirationDate)(0)
        }
    });
}
function $841517d9877cb419$export$2e2bcd8739ae039({ adapter: adapter , providers: providers , maxAge: maxAge = (0, $gCIUE$DEFAULT_MAX_AGE)  }) {
    const host = (0, $gCIUE$nodeprocess).env.PFORTE_URL || (0, $gCIUE$nodeprocess).env.VERCEL_URL || "http://localhost:3000";
    const callbackPath = [
        host,
        (0, $gCIUE$CALLBACK_PATH)
    ].join("/");
    return async function pforteHandler(request, response) {
        const { query: query  } = request;
        switch(query.pforte){
            case "session":
                await $841517d9877cb419$export$aab00477cefa4d42({
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
                $841517d9877cb419$export$ceee541d50ede9fc({
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
                            const { sessionToken: sessionToken , csrfToken: csrfToken  } = $841517d9877cb419$export$b302b4f64c29c57f({
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


export {$841517d9877cb419$export$110700823644f4a6 as setCookie, $841517d9877cb419$export$b302b4f64c29c57f as extendHandler, $841517d9877cb419$export$aab00477cefa4d42 as handleSession, $841517d9877cb419$export$ceee541d50ede9fc as handleSignOut, $841517d9877cb419$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=index.js.map
