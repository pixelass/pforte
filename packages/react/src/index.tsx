import { getSession } from "@pforte/client";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export interface PforteUser {
	name: string;
	email: null | string;
	image: null | string;
	id: string | number;
}

export interface PforteSession {
	user: PforteUser;
}

export const SessionContext = createContext<null | PforteSession>(null);

export function useSession(): null | PforteSession {
	const [session, setSession] = useState(useContext(SessionContext));

	useEffect(() => {
		getSession().then(data => {
			setSession(data);
		});
	}, []);

	return session;
}

export function SessionProvider({ children }: { children?: ReactNode }) {
	const session = useSession();

	return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}
