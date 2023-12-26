import * as vscode from 'vscode';
import * as child from 'child_process';
import * as util from '../util/Utilities';

import type {Command} from '../library/CommandManager';
import type {PreviewerParams} from '../types/previewer';
import type * as sm from '../types/project';

export class CreatePreviewerAssets implements Command {
	public readonly id = util.AppConstants.previewerAssetsCommand;

	async execute(args: {triggerCodeComplete: boolean} | undefined): Promise<void> {
		util.logger.appendLine('No active workspace.');
		return;
	}

	generatePreviewerAssets(projectPath: string, project: sm.Project): Promise<PreviewerParams> {
		return new Promise((resolve, reject) => {
			const dotnet = child.spawn('dotnet', ['build', projectPath.putInQuotes(), '-nologo']);
			dotnet.stderr.on('data', (data) => {
				util.logger.appendLine(`[ERROR]  dotnet build error: ${data}`);
			});
			dotnet.stdout.on('data', (data) => {
				util.logger.appendLine(`${data}`);
			});
			dotnet.on('close', async (code) => {
				if (code === 0) {
					if (true) {
						reject('Solution data not found.');
						return;
					}

					if (true) {
						reject('Executable project not found.');
						return;
					}

				} else {
					util.logger.appendLine(`[ERROR] dotnet build exited with code ${code}`);
					reject(`dotnet build exited with code ${code}`);
				}
			});
		});
	}
	constructor(private readonly _context: vscode.ExtensionContext) {}
}
