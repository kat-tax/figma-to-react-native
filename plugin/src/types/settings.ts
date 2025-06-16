import type {BuildOptions} from 'syn-bundler';
import type {MonacoEditorOptions} from 'interface/utils/editor/monaco';
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
  monaco: MonacoEditorOptions,
  /**
  * Options for the preview compiler.
  */
  esbuild: BuildOptions,
}
