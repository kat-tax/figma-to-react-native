import type {Settings} from 'lib/types/settings';
// import {AutoTypings, LocalStorageCache} from 'monaco-editor-auto-typings';
import {useMonaco} from '@monaco-editor/react';
import {useEffect} from 'react';

type Library = {
  path: string,
  content: string,
};

export function useEditor(settings: Settings, libs?: Library[]) {
  const editor = useMonaco();

  useEffect(() => {
    // Set monaco options
    const defaults = editor?.languages.typescript.typescriptDefaults;
    defaults?.setCompilerOptions(settings.display.editor.compiler);
    defaults?.setInlayHintsOptions(settings.display.editor.inlayHints);
    defaults?.setDiagnosticsOptions(settings.display.editor.diagnostics);
    // Register library references
    if (libs) {
      defaults?.setExtraLibs(libs);
      libs.forEach((lib) => {
        editor?.editor.createModel(lib.content, 'typescript', editor.Uri.parse(lib.path))
      });
    }
    // AutoTypings.create(editor, {sourceCache: new LocalStorageCache()});
  }, [editor, settings, libs]);

  return editor;
}
