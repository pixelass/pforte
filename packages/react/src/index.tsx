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

/**
 * Context to store the current session. The context is used to persist the
 * session when unmounting and mounting components i.e. due to route changes
 */
export const SessionContext = createContext<null | PforteSession>(null);

/**
 * Looks for an active session and return it. Uses the context to persist the
 * session.
 */
export function useSession(): null | PforteSession {
	const [session, setSession] = useState(useContext(SessionContext));

	useEffect(() => {
		getSession().then(data => {
			setSession(data);
		});
	}, []);

	return session;
}

/**
 * Caches session in a context to persist it on route changes.
 * This component should be wrapped around your router, we recommend using it as the outermost
 * component in your app.
 *
 * @param children
 *
 * @example
 * export default function App() {
 * 	return (
 * 		<SessionProvider>
 * 			<BrowserRouter>
 * 				<Routes>
 * 					<Route path="/">
 * 						<Route index element={<Home />} />
 * 						<Route path="secret/" element={<Secret />} />
 * 					</Route>
 * 				</Routes>
 * 			</BrowserRouter>
 * 		</SessionProvider>
 * 	);
 * }
 */
export function SessionProvider({ children }: { children?: ReactNode }) {
	const session = useSession();

	return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}
