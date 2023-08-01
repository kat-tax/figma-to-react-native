import type {TransformOptions} from 'esbuild-wasm';
import type {editor, languages} from 'monaco-editor/esm/vs/editor/editor.api';
import type {Options as CodeBlockWriterOptions} from 'code-block-writer';
import type {ExportFormState} from 'types/export';

export interface Settings {
  react: {
    flavor: 'react-native' | 'tamagui',
    styleGen: 'figma' | 'experimental',
    addImport?: boolean,
    addTranslate?: boolean,
  }
  export: ExportFormState,
  writer: CodeBlockWriterOptions,
  monaco: {
    general: editor.IStandaloneEditorConstructionOptions,
    compiler?: languages.typescript.CompilerOptions,
    inlayHints?: languages.typescript.InlayHintsOptions,
    diagnostics?: languages.typescript.DiagnosticsOptions,
  },
  esbuild: TransformOptions,
}
