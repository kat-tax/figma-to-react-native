import type {Options as CodeOptions} from 'code-block-writer';
import type {editor} from 'monaco-editor/esm/vs/editor/editor.api';

export interface PluginSettings {
  ui: ShowUIOptions;
}

export interface CodeSettings {
  /**
   * Options for the code editor
   */
  editor?: editor.IStandaloneEditorConstructionOptions,
  /**
   * Options for the generated code
   */
  output: CodeOptions;
}
