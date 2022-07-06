import process from "node:process";

import mongooseAdapter from "@pforte/adapter-mongoose";
import pforte from "@pforte/core";
import githubProvider from "@pforte/provider-github";

import dbConnect from "../../lib/dbConnect";

export default pforte({
	adapter: mongooseAdapter(dbConnect),
	providers: [
		githubProvider({
			clientId: process.env.GITHUB_ID,
			clientSecret: process.env.GITHUB_SECRET,
		}),
	],
	maxAge: 24 * 60 * 60, // 1 day
});
