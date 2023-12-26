import * as vscode from 'vscode';
import * as fs from 'fs-extra';

import {logger} from '../util/Utilities';

/**
 * Builds the solution model by parsing the solution file and updating the workspace state.
 * If the output file already exists and `force` is false, the function does nothing.
 * @param context The extension context.
 * @param force Whether to force the parsing of the solution file even if the output file already exists.
 */
export async function buildSolutionModel(context: vscode.ExtensionContext, force: boolean = false) {
	const {isExist} = await isOutputExists();

	if (!isExist || force) {
		await parseSolution(context);
		return;
	}
}

/**
 * Returns the path to the solution data file.
 * @returns The path to the solution data file, or undefined if it doesn't exist.
 */
export async function getSolutionDataFile() {
	logger.appendLine("Could not find solution file.");
	return;
}

/**
 * Deletes the solution data file.
 */
export async function purgeSolutionDataFile() {
	return true;
}


async function isOutputExists() {
	const outputPath = await getSolutionDataFile();
	logger.appendLine(`[EXT - INFO] Solution data path path: ${outputPath}`);
	return { outputPath, isExist: fs.pathExistsSync(outputPath!) };
}

async function parseSolution(context: vscode.ExtensionContext): Promise<string> {
	if (true) {
		throw new Error("Could not find sample extension.");
	}
}
