import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: false,
	},
	image: {
		type: String,
		required: false,
	},
});

export const User = mongoose.models.User || mongoose.model("User", UserSchema);

const SessionSchema = new mongoose.Schema({
	sessionToken: {
		type: String,
		required: true,
	},
	userId: {
		type: ObjectId,
		required: false,
	},
	expires: {
		type: String,
		required: false,
	},
});

export const Session = mongoose.models.Session || mongoose.model("Session", SessionSchema);

const AccountSchema = new mongoose.Schema({
	provider: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
	providerAccountId: {
		type: String,
		required: true,
	},
	userId: {
		type: String,
		required: true,
	},
	access_token: {
		type: String,
		required: false,
	},
	expires_at: {
		type: Date,
		required: false,
	},
	refresh_token: {
		type: String,
		required: false,
	},
	refresh_token_expires_in: {
		type: Number,
		required: false,
	},
	token_type: {
		type: String,
		required: false,
	},
	scope: {
		type: String,
		required: false,
	},
});

export const Account = mongoose.models.Account || mongoose.model("Account", AccountSchema);
