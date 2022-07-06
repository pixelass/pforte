import process from "node:process";

import { GITHUB_PATH } from "@pforte/constants";
import axios from "axios";

export default function githubProvider(config) {
	const host = process.env.PFORTE_URL || process.env.VERCEL_URL || "http://localhost:3000";
	const redirectUri = [host, GITHUB_PATH].join("/");
	const { clientId, clientSecret } = config;
	return {
		url: `https://github.com/login/oauth/authorize?scope=user&client_id=${clientId}&redirect_uri=${redirectUri}`,
		name: "github",
		async connect({ request }) {
			// Get access token
			const { data: accessToken } = await axios.post(
				"https://github.com/login/oauth/access_token",
				{},
				{
					params: {
						client_id: clientId,
						client_secret: clientSecret,
						redirect_uri: redirectUri,
						code: request.query.code,
					},
					headers: {
						Accept: "application/json",
					},
				}
			);

			// Get user with access token
			const { data: user } = await axios.get("https://api.github.com/user", {
				headers: {
					Authorization: `token ${accessToken.access_token}`,
				},
			});

			return { user, accessToken };
		},
	};
}
