var $jtscG$pforteutils = require("@pforte/utils");
var $jtscG$mongodb = require("mongodb");
var $jtscG$mongoose = require("mongoose");

function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}
function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "default", () => $649c7c81463ccbf3$export$2e2bcd8739ae039);



const $0b8e536346597975$var$UserSchema = new (0, ($parcel$interopDefault($jtscG$mongoose))).Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    }
});
const $0b8e536346597975$export$1f44aaf2ec115b54 = (0, ($parcel$interopDefault($jtscG$mongoose))).models.User || (0, ($parcel$interopDefault($jtscG$mongoose))).model("User", $0b8e536346597975$var$UserSchema);
const $0b8e536346597975$var$SessionSchema = new (0, ($parcel$interopDefault($jtscG$mongoose))).Schema({
    sessionToken: {
        type: String,
        required: true
    },
    userId: {
        type: (0, $jtscG$mongodb.ObjectId),
        required: false
    },
    expires: {
        type: String,
        required: false
    }
});
const $0b8e536346597975$export$1fb4852a55678982 = (0, ($parcel$interopDefault($jtscG$mongoose))).models.Session || (0, ($parcel$interopDefault($jtscG$mongoose))).model("Session", $0b8e536346597975$var$SessionSchema);
const $0b8e536346597975$var$AccountSchema = new (0, ($parcel$interopDefault($jtscG$mongoose))).Schema({
    provider: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    providerAccountId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    access_token: {
        type: String,
        required: false
    },
    expires_at: {
        type: Date,
        required: false
    },
    refresh_token: {
        type: String,
        required: false
    },
    refresh_token_expires_in: {
        type: Number,
        required: false
    },
    token_type: {
        type: String,
        required: false
    },
    scope: {
        type: String,
        required: false
    }
});
const $0b8e536346597975$export$1ed4b10e4aba04a7 = (0, ($parcel$interopDefault($jtscG$mongoose))).models.Account || (0, ($parcel$interopDefault($jtscG$mongoose))).model("Account", $0b8e536346597975$var$AccountSchema);


async function $649c7c81463ccbf3$var$getUser({ user: user , accessToken: accessToken , sessionToken: sessionToken , maxAge: maxAge  }) {
    // Check for an existing account
    const existingAccount = await (0, $0b8e536346597975$export$1ed4b10e4aba04a7).findOne({
        providerAccountId: user.id
    });
    // Create an expiration date for sessions
    const expires = (0, $jtscG$pforteutils.getExpirationDate)(maxAge);
    // When an account exists
    if (existingAccount) {
        // Then find the user
        const existingUser = await (0, $0b8e536346597975$export$1f44aaf2ec115b54).findById(existingAccount.userId);
        // When a user exists
        if (existingUser) {
            // Then find existing sessions
            const existingSessions = await (0, $0b8e536346597975$export$1fb4852a55678982).find({
                userId: existingUser._id
            });
            // And delete all of them
            await Promise.all(existingSessions.map(async (session_)=>await (0, $0b8e536346597975$export$1fb4852a55678982).findByIdAndDelete(session_._id)));
            // Then create a new session
            await (0, $0b8e536346597975$export$1fb4852a55678982).create({
                sessionToken: sessionToken,
                userId: existingUser._id,
                expires: expires
            });
            // And return the existing user
            return {
                user: {
                    // Normalize the key for id:
                    // _id -> id
                    id: existingUser._id,
                    name: existingUser.name,
                    email: existingUser.email,
                    image: existingUser.image
                }
            };
        }
    }
    // Else create a new user
    const newUser = await (0, $0b8e536346597975$export$1f44aaf2ec115b54).create({
        name: user.name,
        email: user.email,
        image: user.avatar_url
    });
    // And create a new account
    await (0, $0b8e536346597975$export$1ed4b10e4aba04a7).create({
        providerAccountId: user.id,
        provider: "github",
        type: "oauth",
        access_token: accessToken.access_token,
        expires_at: accessToken.expires_at,
        refresh_token: accessToken.refresh_token,
        refresh_token_expires_in: accessToken.refresh_token_expires_in,
        token_type: accessToken.token_type,
        scope: accessToken.scope,
        userId: newUser._id
    });
    // And create a new session
    await (0, $0b8e536346597975$export$1fb4852a55678982).create({
        sessionToken: sessionToken,
        userId: newUser._id,
        expires: expires
    });
    // And return the new user
    return {
        user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            image: newUser.image
        }
    };
}
async function $649c7c81463ccbf3$var$getSession({ sessionToken: sessionToken  }) {
    const existingSession = await (0, $0b8e536346597975$export$1fb4852a55678982).findOne({
        sessionToken: sessionToken
    });
    if (existingSession) {
        const existingUser = await (0, $0b8e536346597975$export$1f44aaf2ec115b54).findById(existingSession.userId);
        return {
            id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            image: existingUser.image
        };
    } else return null;
}
function $649c7c81463ccbf3$export$2e2bcd8739ae039(connect) {
    return async function adapter(type, payload) {
        await connect();
        switch(type){
            case "user":
                // Payload:
                // { user, accessToken, sessionToken, maxAge }
                return $649c7c81463ccbf3$var$getUser(payload);
            case "session":
                // Payload:
                // { sessionToken }
                return $649c7c81463ccbf3$var$getSession(payload);
            default:
                break;
        }
    };
}


//# sourceMappingURL=index.js.map
