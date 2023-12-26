import * as vscode from 'vscode';

import {CommandManager} from '../library/CommandManager';
import {PreviewProcessManager} from '../library/PreviewProcessManager';

import {CreateNewProject} from './CreateNewProject';
import {PreviewerProcess} from './PreviewerProcess';
import {UpdatePreviewer} from './UpdatePreviewer';
import {ShowPreviewToSide} from './ShowPreviewToSide';

const processManager = new PreviewProcessManager();

export function registerCommands(
	commandManager: CommandManager,
	context: vscode.ExtensionContext,
): vscode.Disposable {
	commandManager.register(new CreateNewProject());
	commandManager.register(new UpdatePreviewer(context));
	commandManager.register(new ShowPreviewToSide(context, processManager));
	commandManager.register(new PreviewerProcess(context, processManager));
	return commandManager;
}
