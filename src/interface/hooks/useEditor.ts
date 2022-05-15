import {useEffect} from 'react';
import {useMonaco} from '@monaco-editor/react';
// import {AutoTypings, LocalStorageCache} from 'monaco-editor-auto-typings';
import type {Settings} from 'types/settings';
import type {Library} from 'types/plugin';

export function useEditor(settings: Settings, libs?: Library[]) {
  const editor = useMonaco();

  // Set monaco options & register lib references
  useEffect(() => {
    const defaults = editor?.languages.typescript.typescriptDefaults;
    defaults?.setCompilerOptions(settings.display.editor.compiler);
    defaults?.setInlayHintsOptions(settings.display.editor.inlayHints);
    defaults?.setDiagnosticsOptions(settings.display.editor.diagnostics);
    if (libs) {
      defaults?.setExtraLibs(libs);
      libs.forEach((lib) => {
        editor?.editor.createModel(
          lib.content,
          'typescript',
          editor.Uri.parse(lib.path),
        )
      });
    }
    // AutoTypings.create(editor, {sourceCache: new LocalStorageCache()});
  }, [editor, settings, libs]);

  return editor;
}
