import {getSession as $9LSzE$getSession} from "@pforte/client";
import {useState as $9LSzE$useState, useEffect as $9LSzE$useEffect} from "react";



function $2cdd4e5d03d5f5bd$export$ad0a340bf97d63d5() {
    const [session, setSession] = (0, $9LSzE$useState)(null);
    (0, $9LSzE$useEffect)(()=>{
        (0, $9LSzE$getSession)().then((data)=>{
            setSession(data);
        });
    }, []);
    return session;
}


export {$2cdd4e5d03d5f5bd$export$ad0a340bf97d63d5 as useSession};
//# sourceMappingURL=index.js.map
