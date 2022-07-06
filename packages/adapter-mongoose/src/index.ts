import process from "node:process";

import { getExpirationDate } from "@pforte/utils";

import { Account, Session, User } from "./models";

async function getUser({ user, accessToken, sessionToken, maxAge }) {
	// Check for an existing account
	const existingAccount = await Account.findOne({
		providerAccountId: user.id,
	});
	// Create an expiration date for sessions
	const expires = getExpirationDate(maxAge);

	// When an account exists
	if (existingAccount) {
		// Then find the user
		const existingUser = await User.findById(existingAccount.userId);

		// When a user exists
		if (existingUser) {
			// Then find existing sessions
			const existingSessions = await Session.find({
				userId: existingUser._id,
			});
			// And delete all of them
			await Promise.all(
				existingSessions.map(
					async session_ => await Session.findByIdAndDelete(session_._id)
				)
			);
			// Then create a new session
			await Session.create({
				sessionToken,
				userId: existingUser._id,
				expires,
			});

			// And return the existing user
			return {
				user: {
					// Normalize the key for id:
					// _id -> id
					id: existingUser._id,
					name: existingUser.name,
					email: existingUser.email,
					image: existingUser.image,
				},
			};
		}
	}

	// Else create a new user
	const newUser = await User.create({
		name: user.name,
		email: user.email,
		image: user.avatar_url,
	});
	// And create a new account
	await Account.create({
		providerAccountId: user.id,
		provider: "github",
		type: "oauth",
		access_token: accessToken.access_token,
		expires_at: accessToken.expires_at,
		refresh_token: accessToken.refresh_token,
		refresh_token_expires_in: accessToken.refresh_token_expires_in,
		token_type: accessToken.token_type,
		scope: accessToken.scope,
		userId: newUser._id,
	});
	// And create a new session
	await Session.create({
		sessionToken,
		userId: newUser._id,
		expires,
	});

	// And return the new user
	return {
		user: {
			id: newUser._id,
			name: newUser.name,
			email: newUser.email,
			image: newUser.image,
		},
	};
}

async function getSession({ sessionToken }) {
	const existingSession = await Session.findOne({
		sessionToken,
	});
	if (existingSession) {
		const existingUser = await User.findById(existingSession.userId);
		return {
			id: existingUser._id,
			name: existingUser.name,
			email: existingUser.email,
			image: existingUser.image,
		};
	} else {
		return null;
	}
}

export default function mongooseAdapter(connect) {
	return async function adapter(type, payload) {
		await connect();
		switch (type) {
			case "user":
				// Payload:
				// { user, accessToken, sessionToken, maxAge }
				return getUser(payload);
			case "session":
				// Payload:
				// { sessionToken }
				return getSession(payload);
			default:
				break;
		}
	};
}
