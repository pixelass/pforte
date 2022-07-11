import { getExpirationDate } from "@pforte/utils";

import { Account, Session, User } from "./models";

/**
 * GitHub User model
 */
export interface GitHubUserType {
	id: string;
	name: string;
	email: string | null;
	avatar_url: string | null;
}

/**
 * User model
 */
export interface UserType {
	id: string;
	name: string;
	email: string | null;
	image: string | null;
}

interface AccessToken {
	access_token: string;
	expires_at: string;
	refresh_token: string;
	refresh_token_expires_in: string;
	token_type: string;
	scope: string;
}

interface GetUserProps {
	user: UserType;
	accessToken: AccessToken;
	sessionToken: string;
	csrfToken: string;
	maxAge: number;
}

/**
 * Storage adapter
 */

export type UserAdapter = (name: "user", payload: GetUserProps) => Promise<UserType>;

export type SessionAdapter = (
	name: "session",
	payload: { sessionToken: string }
) => Promise<UserType | null>;

export type Adapter = UserAdapter | SessionAdapter;

async function getUser({
	user,
	accessToken,
	sessionToken,
	maxAge,
}: GetUserProps): Promise<UserType> {
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
				userId: existingUser._idn,
				expires,
			});

			// And return the existing user
			return {
				// Normalize the key for id:
				// _id -> id
				id: existingUser._id,
				name: existingUser.name,
				email: existingUser.email,
				image: existingUser.image,
			};
		}
	}

	// Else create a new user
	const newUser = await User.create({
		name: user.name,
		email: user.email,
		image: user.image,
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
		id: newUser._id,
		name: newUser.name,
		email: newUser.email,
		image: newUser.image,
	};
}

async function getSession({ sessionToken }: { sessionToken: string }): Promise<UserType | null> {
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

export default function mongooseAdapter(connect: () => Promise<void>): Adapter {
	return async function adapter(
		type: "session" | "user",
		payload: GetUserProps | { sessionToken: string; csrfToken: string }
	) {
		await connect();
		switch (type) {
			case "user":
				// Payload:
				// { user, accessToken, sessionToken, maxAge }
				return getUser(payload as GetUserProps);
			case "session":
				// Payload:
				// { sessionToken }
				return getSession(payload as { sessionToken: string });
			default:
				break;
		}
	};
}
