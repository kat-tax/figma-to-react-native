import type * as vscode from 'vscode';

export interface ShowPreviewSettings {
  readonly sideBySide?: boolean,
  readonly locked?: boolean,
}

export interface PreviewerData {
  readonly file: vscode.Uri,
  readonly pid?: number,
  readonly previewerUrl?: string,
  readonly wsAddress?: string,
  readonly assetsAvailable?: boolean,
}

export interface PreviewerParams {
  previewerPath: string,
  targetPath: string,
  projectRuntimeConfigFilePath: string,
  projectDepsFilePath: string,
}
