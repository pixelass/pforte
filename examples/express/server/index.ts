import process from "node:process";

import mongooseAdapter from "@pforte/adapter-mongoose";
import pforte from "@pforte/core";
import githubProvider from "@pforte/provider-github";
import express from "express";

import dbConnect from "../lib/dbConnect";

const app = express();
const port = 3001;

app.use(express.json());

/**
 * Demo route
 */
app.get("/api/hello", (request, response) => {
	response.status(200).json({ name: "John Doe" });
});

const auth = pforte({
	adapter: mongooseAdapter(dbConnect),
	providers: [
		githubProvider({
			clientId: process.env.GITHUB_ID,
			clientSecret: process.env.GITHUB_SECRET,
		}),
	],
	maxAge: 24 * 60 * 60, // 1 day
});

/**
 * Pforte requires a GET route for its API
 */
app.get("/api/auth/:pforte", (request, response) => {
	// Pforte expects the "pforte" parameter to be part of the query
	request.query.pforte = request.params.pforte;

	void auth(request, response);
});

/**
 * Pforte requires a POST route for the session
 */
app.post("/api/auth/session", (request, response) => {
	// Pforte expects "pforte" on the query to be "session"
	request.query.pforte = "session";

	void auth(request, response);
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
