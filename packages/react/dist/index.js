var $9BJiJ$pforteclient = require("@pforte/client");
var $9BJiJ$react = require("react");

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useSession", () => $5a17ac3a5726ce24$export$ad0a340bf97d63d5);


function $5a17ac3a5726ce24$export$ad0a340bf97d63d5() {
    const [session, setSession] = (0, $9BJiJ$react.useState)(null);
    (0, $9BJiJ$react.useEffect)(()=>{
        (0, $9BJiJ$pforteclient.getSession)().then((data)=>{
            setSession(data);
        });
    }, []);
    return session;
}


//# sourceMappingURL=index.js.map
