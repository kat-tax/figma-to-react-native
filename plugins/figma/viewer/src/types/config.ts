import type {Options as CodeBlockWriterOptions} from 'code-block-writer';
import type {editor, languages} from 'monaco-editor/esm/vs/editor/editor.api';

export interface PluginSettings {
  ui: ShowUIOptions;
}

export interface CodeSettings {
  output: CodeBlockWriterOptions;
  editor: editor.IStandaloneEditorConstructionOptions,
  compiler?: languages.typescript.CompilerOptions,
  inlayHints?: languages.typescript.InlayHintsOptions,
  diagnostics?: languages.typescript.DiagnosticsOptions,
}
