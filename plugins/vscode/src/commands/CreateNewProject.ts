import path = require('path');
import * as vscode from 'vscode';
import * as child from 'child_process';
import * as util from '../util/Utilities';

import type {Command} from '../library/CommandManager';

export class CreateNewProject implements Command {
	public readonly id = util.AppConstants.newProjectCommandId;

	public async execute() {
		const selection = await vscode.window.showQuickPick(this.projectList);
		if (!selection) {
			return;
		}

		const projectName = await vscode.window.showInputBox({
			prompt: 'Enter project name',
			placeHolder: 'Exo App',
		});

		let projectPath = await vscode.window.withProgress<string>(
			{ location: vscode.ProgressLocation.Notification, cancellable: false },
			async (progress) => {
				progress.report({ message: `Creating a new project: ${projectName}` });
				try {
					return (await this.createProject(projectName, selection.key)) ?? '';
				} catch (error) {
					return '';
				}
			}
		);

		if (projectPath.trim() === '') {
			vscode.window.showErrorMessage(
				'Failed to create project. Make sure you have EXO Project Templates installed. [Learn More](https://exo-ui.com)'
			);
			return;
		}

		const result = await vscode.window.showInformationMessage(
			`Project ${projectName} created at ${projectPath}`,
			'Open',
			'Cancel'
		);

		if (result === 'Open') {
			vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectPath), false);
		}
	}

	async createProject(projectName: string | undefined, template: string): Promise<string | undefined> {
		if (!projectName || !template) {
			return;
		}
		const folders = await vscode.window.showOpenDialog({
			openLabel: 'Select',
			canSelectFolders: true,
			canSelectFiles: false,
		});

		const folder = folders ? folders[0].fsPath : undefined;
		if (!folder) {
			return;
		}

		const projectPath = path.join(folder, projectName);

		return new Promise((resolve, reject) => {
			const dotnet = child.spawn('dotnet', ['new', template, '-n', projectName, '-o', projectPath]);
			dotnet.stderr.on('data', (data) => {
				util.logger.error(data.toString());
			});
			dotnet.on('close', (code) => {
				if (code === 0) {
					util.logger.appendLine(`Project ${projectName} created at ${folder}`);
					resolve(projectPath);
				} else {
					reject('Failed to create project');
				}
			});
		});
	}

	projectList = [
		new ProjectTemplate('EXO App', 'Minimal starter ', 'exo.app'),
		new ProjectTemplate('ULT App', 'Full production app ', 'ult.app'),
	];
}

class ProjectTemplate implements vscode.QuickPickItem {
	constructor(label: string, details: string, key: string) {
		this.label = label;
		this.detail = details;
		this.key = key;
	}
	label: string;
	detail?: string | undefined;
	key: string;
}
