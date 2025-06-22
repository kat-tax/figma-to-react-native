import type {BuildOptions} from 'syn-bundler';
import type {MonacoEditorOptions} from 'interface/utils/editor/monaco';
import type {Options as CodeBlockWriterOptions} from 'code-block-writer';

export interface UserSettings {
  /**
  * Options for the code editor.
  */
  monaco: MonacoEditorOptions,
  /**
  * Options for the preview compiler.
  */
  esbuild: BuildOptions,
}

export interface ProjectSettings extends UserSettings {
  /**
   * Project token from https://figma-to-react-native.com
   */
  projectToken: string,
  /**
   * Enable to add translations tags to strings
   */
  translate?: boolean,
  /**
  * Options for the code writer.
  */
  writer: CodeBlockWriterOptions,
  /**
   * Git configuration
   */
  git: {
    /**
     * Git personal access token
     */
    key: string,
    /**
     * Git repository URL
     */
    repo: string,
    /**
     * Git branch
     */
    branch: string,
  },
}
