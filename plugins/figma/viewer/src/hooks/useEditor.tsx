import {useEffect} from 'react';
import {useMonaco} from '@monaco-editor/react';
// import {AutoTypings, LocalStorageCache} from 'monaco-editor-auto-typings';

import * as config from 'config';

type Library = {
  path: string,
  content: string,
};

export function useEditor(libs?: Library[]) {
  const monaco = useMonaco();

  useEffect(() => {
    monaco?.languages.typescript.typescriptDefaults.setCompilerOptions(config.code.compiler);
    monaco?.languages.typescript.typescriptDefaults.setInlayHintsOptions(config.code.inlayHints);
    monaco?.languages.typescript.typescriptDefaults.setDiagnosticsOptions(config.code.diagnostics);
    if (monaco && libs) {
      monaco.languages.typescript.typescriptDefaults.setExtraLibs(libs);
      libs.forEach((lib) => monaco.editor.createModel(lib.content, 'typescript', monaco.Uri.parse(lib.path)));
    }
    // AutoTypings.create(monaco, {
    //   sourceCache: new LocalStorageCache(),
    // });
  }, [monaco]);

  return monaco;
}
