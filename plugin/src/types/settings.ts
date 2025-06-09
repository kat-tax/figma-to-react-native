import type {BuildOptions} from 'syn-bundler';
import type {editor, languages} from 'monaco-editor/esm/vs/editor/editor.api';
import type {Options as CodeBlockWriterOptions} from 'code-block-writer';

export interface ProjectSettings {
  /**
   * Enable to add translations tags to strings
   */
  addTranslate?: boolean,
  /**
  * Options for the code writer.
  */
  writer: CodeBlockWriterOptions,
}

export interface UserSettings extends ProjectSettings {
  /**
  * Options for the code editor.
  */
  monaco: {
    general: Omit<editor.IStandaloneEditorConstructionOptions, 'ariaContainerElement' | 'overflowWidgetsDomNode'>,
    compiler?: languages.typescript.CompilerOptions,
    inlayHints?: languages.typescript.InlayHintsOptions,
    diagnostics?: languages.typescript.DiagnosticsOptions,
  },
  /**
  * Options for the preview compiler.
  */
  esbuild: BuildOptions,
}
