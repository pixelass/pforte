import { getSession } from "@pforte/client";
import { useEffect, useState } from "react";

export function useSession() {
	const [session, setSession] = useState(null);

	useEffect(() => {
		getSession().then(data => {
			setSession(data);
		});
	}, []);

	return session;
}
