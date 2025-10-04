import type {BuildOptions} from 'web-bundler';
import type {MonacoEditorOptions} from 'interface/utils/editor/monaco';
import type {Options as WriterOptions} from 'code-block-writer';
import type {ProjectComponentLayout} from 'types/project';

export interface UserSettings {
  /**
  * Options for the code editor.
  */
  monaco: MonacoEditorOptions,
  /**
  * Options for the preview compiler.
  */
  esbuild: BuildOptions,
  /**
   * UI preferences
   */
  ui: {
    /**
     * Component layout preference
     */
    componentLayout?: ProjectComponentLayout,
    /**
     * Icon zoom/scale factor
     */
    iconZoom?: number,
  },
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
  writer: WriterOptions,
  /**
   * Git configuration
   */
  git: {
    /**
     * Git repository URL
     */
    repo: string,
    /**
     * Git branch
     */
    branch: string,
    /**
     * Git personal access token
     */
    accessToken: string,
  },
}
