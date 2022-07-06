const path = require("path");

const toPath = path_ => path.join(process.cwd(), path_);

module.exports = {
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
	modulePathIgnorePatterns: ["/dist/"],
	verbose: false,
	setupFilesAfterEnv: ["jest-enzyme"],
	testEnvironment: "enzyme",
	moduleNameMapper: {
		"^@pforte/adapter-mongoose": toPath("packages/adapter-mongoose/src"),
		"^@contour/client": toPath("packages/client/src"),
		"^@pforte/constants": toPath("packages/constants/src"),
		"^@contour/core": toPath("packages/core/src"),
		"^@contour/provider-github": toPath("packages/provider-github/src"),
		"^@pforte/react": toPath("packages/react/src"),
		"^@pforte/utils": toPath("packages/react/src"),
	},
	transformIgnorePatterns: [
		"node_modules/(?!(jest-)?react-native|react-(native|universal|navigation)-(.*)|@react-native-community/(.*)|@react-navigation/(.*)|bs-platform)",
	],
	transform: {
		"^.+\\.tsx?$": "ts-jest",
	},
	globals: {
		"ts-jest": {
			tsConfig: "./tsconfig.json",
		},
	},
};
