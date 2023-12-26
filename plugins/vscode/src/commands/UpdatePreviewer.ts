import * as vscode from 'vscode';
import * as util from '../util/Utilities';

import {PreviewServer} from '../services/PreviewServer';
import {PanelPreviewer} from '../interface/PanelPreviewer';

import type {Command} from '../library/CommandManager';

export class UpdatePreviewer implements Command {
  constructor(private readonly _context: vscode.ExtensionContext) {}
  public readonly id = util.AppConstants.updatePreviewer;

  public async execute(mainUri?: vscode.Uri, _allUris?: vscode.Uri[]) {
    if (!mainUri) {
      return;
    }

    const fileData = util.getFileDetails(mainUri.fsPath, this._context);
    if (!fileData) {
      return;
    }

    const tsxText = await this.getTextFromUri(mainUri);
    PreviewServer.getInstanceByFilePath(fileData.targetPath)?.updateTSX(fileData, tsxText);
    PanelPreviewer.updateTitle(mainUri);
  }

  async getTextFromUri(uri: vscode.Uri): Promise<string> {
    const buffer = await vscode.workspace.fs.readFile(uri);
    return buffer.toString();
  }
}
