import { writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const cwd = process.cwd();
const build = process.argv.includes("--build");

(async () => {
	console.log("Generated package names as JSON");
	const { default: tsconfig } = await import("./tsconfig.tpl.json");
	if (build) {
		await writeFile(path.resolve(cwd, "tsconfig.json"), JSON.stringify(tsconfig, null, 4));
	} else {
		const paths = {
			"@pforte/adapter-mongoose": ["./packages/adapter-mongoose/src"],
			"@pforte/client": ["./packages/client/src"],
			"@pforte/constants": ["./packages/constants/src"],
			"@pforte/core": ["./packages/core/src"],
			"@pforte/provider-github": ["./packages/provider-github/src"],
			"@pforte/react": ["./packages/react/src"],
			"@pforte/utils": ["./packages/utils/src"],
		};
		await writeFile(
			path.resolve(cwd, "tsconfig.json"),
			JSON.stringify(
				{
					...tsconfig,
					compilerOptions: {
						...tsconfig.compilerOptions,
						baseUrl: "./",
						paths,
					},
				},
				null,
				4
			)
		);
	}

	console.log("Added package aliases to tsconfig");
})();
