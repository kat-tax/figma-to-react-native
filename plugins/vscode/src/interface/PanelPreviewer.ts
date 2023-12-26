import * as vscode from 'vscode';
import path = require('path');

import {PreviewProcessManager} from '../library/PreviewProcessManager';
import {logger} from '../util/Utilities';

export class PanelPreviewer {
	private _disposables: vscode.Disposable[] = [];
	private readonly _panel: vscode.WebviewPanel;

	public static readonly viewType = 'webPreviewer';
	public static currentPanel: PanelPreviewer | undefined;

	public static createOrShow(
		url: string,
		fileUri: vscode.Uri,
		extensionUri: vscode.Uri,
		processManager?: PreviewProcessManager,
		previewColumn: vscode.ViewColumn = vscode.ViewColumn.Active,
	) {
		// Already have panel, show it
		const column = previewColumn || vscode.window.activeTextEditor?.viewColumn;
		if (PanelPreviewer.currentPanel) {
			PanelPreviewer.currentPanel._panel.reveal(column);
			PanelPreviewer.currentPanel._update(url);
			return;
		}

		// No panel, create new one
		const panel = vscode.window.createWebviewPanel(
			PanelPreviewer.viewType,
			'Previewer',
			column || vscode.ViewColumn.One,
			{enableScripts: true},
		);

		// Save panel instance
		PanelPreviewer.currentPanel = new PanelPreviewer(panel, url, processManager);

		// Update interface
		this.updateTitle(fileUri);
		PanelPreviewer.currentPanel._panel.iconPath = {
			dark: vscode.Uri.joinPath(extensionUri, 'media', 'preview-dark.svg'),
			light: vscode.Uri.joinPath(extensionUri, 'media', 'preview-light.svg'),
		};
	}

	public static updateTitle(file: vscode.Uri) {
		const currentPanel = PanelPreviewer.currentPanel;
		if (currentPanel) {
			currentPanel._panel.title = `Preview ${path.basename(file.fsPath)}`;
		}
	}

	private constructor(
		panel: vscode.WebviewPanel,
		url: string,
		private readonly _processManager?: PreviewProcessManager
	) {
		this._panel = panel;
		// Set the webview's initial html content
		this._update(url);
		// Listen for when the panel is disposed
		// this happens when the user closes the panel
		// or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
	}

	/**
	 * Cleans up and disposes of webview resources when the webview panel is closed.
	 */
	public dispose() {
		PanelPreviewer.currentPanel = undefined;
		logger.appendLine('Previwer panel disposed');
		// Dispose of the current webview panel
		this._panel.dispose();
		this._processManager?.killPreviewProcess();
		// Dispose of all disposables (i.e. commands) for the current webview panel
		while (this._disposables.length) {
			const disposable = this._disposables.pop();
			if (disposable) {
				disposable.dispose();
			}
		}
	}

	private _update(url: string) {
		this._panel.webview.html = this._getHtmlForWebview(url);
	}

	private _getHtmlForWebview = (url: string) => `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Web Previewer</title>
		</head>
		<body>
			<iframe src="${url}" frameborder="0" style="width:100%; height:100vh;"></iframe>
		</body>
		</html>
	`;
}
