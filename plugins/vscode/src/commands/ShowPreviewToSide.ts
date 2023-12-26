import * as vscode from 'vscode';

import {PanelPreviewer} from '../interface/PanelPreviewer';
import {PreviewProcessManager} from '../library/PreviewProcessManager';
import {AppConstants, logger} from '../util/Utilities';

import type {Command} from '../library/CommandManager';
import type {PreviewerData, ShowPreviewSettings} from '../types/previewer';

export class ShowPreviewToSide implements Command {
	constructor(
		private readonly _context: vscode.ExtensionContext,
		private readonly _processManager: PreviewProcessManager,
	) {}
	public readonly id = AppConstants.showPreviewToSideCommand;

	public async execute(mainUri?: vscode.Uri, _allUris?: vscode.Uri[]) {
		const activeFile = mainUri ?? vscode.window.activeTextEditor?.document.uri;
		let previewerData = this._processManager.getPreviewerData(activeFile?.toString() ?? '');
		if (!previewerData) {
			previewerData = await vscode.commands.executeCommand<PreviewerData>(
				AppConstants.previewProcessCommandId,
				activeFile
			);
		}

		showPreview(this._context, {sideBySide: true}, previewerData, this._processManager);
		new Promise((resolve) => setTimeout(resolve, 1000)).then(() => {
			vscode.commands.executeCommand(AppConstants.updatePreviewer, activeFile);
		});
	}
}

export function showPreview(
	context: vscode.ExtensionContext,
	settings: ShowPreviewSettings,
	previewerData: PreviewerData,
	processManager: PreviewProcessManager,
) {
	let uri = previewerData.file;

	logger.appendLine(`Show Preview to side: ${uri?.toString() ?? 'no mainUri'}`);
	if (!(uri instanceof vscode.Uri) && vscode.window.activeTextEditor)
		uri = vscode.window.activeTextEditor.document.uri;
	if (!(uri instanceof vscode.Uri) && !vscode.window.activeTextEditor)
		return;
	if (uri) {
		const resourceColumn =
			(vscode.window.activeTextEditor && vscode.window.activeTextEditor.viewColumn) || vscode.ViewColumn.One;
		const column = settings.sideBySide ? vscode.ViewColumn.Beside : resourceColumn;
		PanelPreviewer.createOrShow(
			previewerData.previewerUrl!,
			previewerData.file,
			context.extensionUri,
			processManager,
			column,
		);
	}
}
