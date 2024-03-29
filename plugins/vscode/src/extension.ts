import * as vscode from 'vscode';
import * as util from './util/Utilities';

import {CommandManager} from './library/CommandManager';
import {registerCommands} from './commands';

export async function activate(ctx: vscode.ExtensionContext) {
  const manager = new CommandManager();
  ctx.subscriptions.push(registerCommands(manager, ctx));

  if (!vscode.workspace.workspaceFolders) return;

  // Update on change tab
  vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor && util.isExoFile(editor.document)) {
      const tab = vscode.window.tabGroups.all
        .flatMap((tabGroup) => tabGroup.tabs)
        .find((tab) => {
          const tabInput = tab.input as {viewType: string | undefined};
          return (tabInput && tabInput.viewType)
            ? tabInput.viewType.endsWith(util.AppConstants.previewerPanelViewType)
            : false;
        });
      vscode.commands.executeCommand(util.AppConstants.updatePreviewer, editor.document.uri);
      if (!tab || tab?.label.endsWith(util.getFileName(editor.document.fileName))) {
        return;
      }
    }
  });

  // Update on save
  vscode.workspace.onDidSaveTextDocument(document => {
    if (util.isExoFile(document)) {
      vscode.commands.executeCommand(util.AppConstants.updatePreviewer, document.uri);
    }
  });

  util.logger.appendLine('activated');
}

export async function deactivate() {
 util.logger.appendLine('deactivated');
}
