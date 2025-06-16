// This file is a wrapper for the Monaco editor API.
// It is only used to provide type definitions and small classes.
// Probably shouldn't need this, but it's here for now...
// If attempting to remove, please make sure to inspect bundle size.

import type * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

// Types

export type Monaco = typeof monaco;
export type MonacoEditor = monaco.editor.IStandaloneCodeEditor;
export type MonacoWorkerTS = monaco.languages.typescript.TypeScriptWorker;
export type MonacoDeltaDecoration = monaco.editor.IModelDeltaDecoration;
export type MonacoTextModel = monaco.editor.ITextModel;
export type MonacoRange = monaco.Range;
export type MonacoPosition = monaco.Position;
export type MonacoSelection = monaco.Selection;
export type MonacoEditorOptions = {
  general: Omit<monaco.editor.IStandaloneEditorConstructionOptions, 'ariaContainerElement' | 'overflowWidgetsDomNode'>,
  compiler?: monaco.languages.typescript.CompilerOptions,
  inlayHints?: monaco.languages.typescript.InlayHintsOptions,
  diagnostics?: monaco.languages.typescript.DiagnosticsOptions,
}

// Interfaces

export {Range as MonacoRange} from 'monaco-editor/esm/vs/editor/common/core/range';
export {Position as MonacoPosition} from 'monaco-editor/esm/vs/editor/common/core/position';
export {Selection as MonacoSelection} from 'monaco-editor/esm/vs/editor/common/core/selection';

// Enums

export const MonacoSelectionDirection = {'LTR': 0, 'RTL': 1} as const;
export type MonacoSelectionDirection = (typeof MonacoSelectionDirection)[keyof typeof MonacoSelectionDirection];
