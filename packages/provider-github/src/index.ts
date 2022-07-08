import process from "node:process";

import { GITHUB_PATH } from "@pforte/constants";
import axios from "axios";

/**
 * Mongodb User model
 */
export interface User {
	id: string;
	name: string;
	email: string | null;
	image: string | null;
}

/**
 * GitHub specific configuration
 */
interface GithubProviderConfig {
	clientId: string;
	clientSecret: string;
}

/**
 * GitHub specific access token
 */
export interface GithubAccessToken {
	access_token: string;
	scope: string;
	token_type: string;
}

/**
 * Auth provider
 */
export interface Provider {
	url: string;
	name: string;
	connect({ request: ApiRequest }): Promise<{ accessToken: GithubAccessToken; user: User }>;
}

/**
 * GitHub provider
 *
 * @param config
 */
export default function githubProvider(config: GithubProviderConfig): Provider {
	const host = process.env.PFORTE_URL || process.env.VERCEL_URL || "http://localhost:3000";
	const redirectUri = [host, GITHUB_PATH].join("/");
	const { clientId, clientSecret } = config;
	return {
		url: `https://github.com/login/oauth/authorize?scope=user&client_id=${clientId}&redirect_uri=${redirectUri}`,
		name: "github",
		async connect({ request }) {
			// Get access token
			const { data: accessToken } = await axios.post<GithubAccessToken>(
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
			const { data: user } = await axios.get<User>("https://api.github.com/user", {
				headers: {
					Authorization: `token ${accessToken.access_token}`,
				},
			});

			return { user, accessToken };
		},
	};
}
