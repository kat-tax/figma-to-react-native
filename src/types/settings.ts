import type {TransformOptions} from 'esbuild-wasm';
import type {editor, languages} from 'monaco-editor/esm/vs/editor/editor.api';
import type {Options as CodeBlockWriterOptions} from 'code-block-writer';

export interface Settings {
  /**
  * Options for code generation.
  */
  react: {
    /**
     * The flavor of React Native to generate
     */
    flavor: 'react-native' | 'tamagui',
    /**
     * The engine used to convert Figma styles to React Native
     */
    styleGen:  'default' | 'service' | 'experimental',
    /**
     * Enable to add translations tags to strings
     */
    addTranslate?: boolean,
  }
  writer: CodeBlockWriterOptions,
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
  esbuild: TransformOptions,
}
