import * as vscode from 'vscode';
import path = require('path');

import type * as sm from '../types/project';

export const exoLanguageId = 'typescriptreact';
export const exoFileExtension = 'tsx';
export const logger = vscode.window.createOutputChannel('F2RN', {log: true});

/**
 * Checks if the given document is an EXO file.
 * @param document vscode TextDocument
 * @returns `true` if it's an EXO file, `false` otherwise
 */
export function isExoFile(document: vscode.TextDocument): boolean {
	return path.extname(document.fileName) === `.${exoFileExtension}`;
}

/**
 * Checks if the given document is an EXO file.
 * @param filePath file path
 * @returns filename
 */
export function getFileName(filePath: string): string {
	return path.basename(filePath);
}

/**
 * Returns the file details from solution model
 * @param file file path
 * @param context vscode extension context
 * @returns File details from solution model
 */
export function getFileDetails(file: string, context: vscode.ExtensionContext): sm.File | undefined {
	return undefined;
}

declare global {
	interface Array<T> {
		getValue(property: string): string;
	}

	interface String {
		putInQuotes(): string;
	}
}

Array.prototype.getValue = function (this: string[], property: string): string {
	const value = this.find((line) => line.includes(property));
	return value ? value.split('=')[1].trim() : '';
};

String.prototype.putInQuotes = function (this: string): string {
	return `'${this}'`;
};

/**
 * Various app constants
 */
export class AppConstants {
	static readonly previewerParamState = 'previewerParams';
	static readonly previewProcessCommandId = 'exo.previewProcess';
	static readonly localhost = '127.0.0.1';
	static readonly htmlUrl = `http://${AppConstants.localhost}`;

	static webSocketAddress = (port: number) => `ws://${AppConstants.localhost}:${port}/ws`;

	static readonly showPreviewToSideCommand = 'exo.showPreviewToSide';
	static readonly previewerAssetsCommand = 'exo.createPreviewerAssets';

	static readonly updatePreviewer = 'exo.updatePreviewer';
	static readonly newProjectCommandId = 'exo.newProject';

	static readonly previewerPanelViewType = 'exoPreviewer';
}
