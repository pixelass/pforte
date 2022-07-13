import { SessionProvider } from "@pforte/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./pages/home";
import Secret from "./pages/secret";

export default function App() {
	return (
		<SessionProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/">
						<Route index element={<Home />} />
						<Route path="secret/" element={<Secret />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</SessionProvider>
	);
}
