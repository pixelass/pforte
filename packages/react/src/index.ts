import { getSession } from "@pforte/client";
import { useEffect, useState } from "react";

export interface PforteUser {
	name: string;
	email: null | string;
	image: null | string;
	id: string | number;
}

export interface PforteSession {
	user: PforteUser;
}

export function useSession(): null | PforteSession {
	const [session, setSession] = useState(null);

	useEffect(() => {
		getSession().then(data => {
			setSession(data);
		});
	}, []);

	return session;
}
