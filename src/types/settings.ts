import type {TransformOptions} from 'esbuild-wasm';
import type {editor, languages} from 'monaco-editor/esm/vs/editor/editor.api';
import type {Options as CodeBlockWriterOptions} from 'code-block-writer';

export interface Settings {
  display: {
    /**
     * Configure plugin UI options
     */
    plugin: ShowUIOptions,
    /**
     * Configure Monaco editor options
     */
    editor: {
      general: editor.IStandaloneEditorConstructionOptions,
      compiler?: languages.typescript.CompilerOptions,
      inlayHints?: languages.typescript.InlayHintsOptions,
      diagnostics?: languages.typescript.DiagnosticsOptions,
    },
  },
  /**
   * Configure code output settings
   */
  output: {
    react: {
      /**
       * Which React Native code style to use 
       */
      flavor: 'react-native' | 'tamagui',
      /** 
       * Include: import React from "react"?
       */
      addImport?: boolean,
      /** 
       * Translate text strings and add the LinguiJS package?
       */
      addTranslate?: boolean,
    }
    format?: CodeBlockWriterOptions,
  },
  /** 
   * Configure component preview settings
   */
  preview: {
    transform: TransformOptions,
  },
}
