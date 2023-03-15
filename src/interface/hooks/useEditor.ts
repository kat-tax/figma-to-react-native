import {useEffect} from 'react';
import {useMonaco} from '@monaco-editor/react';
import settingsSchema from 'interface/templates/settings-schema.json';

// import AutoImport, {regexTokeniser} from '@blitz/monaco-auto-import'
// import {AutoTypings, LocalStorageCache} from 'monaco-editor-auto-typings';

import type {Settings} from 'types/settings';
import type {EditorLibrary} from 'types/editor';

export function useEditor(settings: Settings, libs?: EditorLibrary[]) {
  const monaco = useMonaco();

  useEffect(() => {
    // Setup settings schema + validation
    const json = monaco?.languages.json.jsonDefaults;
    json?.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: 'http://ult.dev/figaro-settings-schema.json',
          fileMatch: [monaco?.Uri.parse('Settings.json').toString()],
          schema: settingsSchema,
        }
      ],
    });

    // Setup typescript options and libs
    const typescript = monaco?.languages.typescript.typescriptDefaults;
    typescript?.setCompilerOptions(settings.display.editor.compiler);
    typescript?.setInlayHintsOptions(settings.display.editor.inlayHints);
    typescript?.setDiagnosticsOptions(settings.display.editor.diagnostics);
    if (libs) {
      typescript?.setExtraLibs(libs);
      libs.forEach((lib) => {
        monaco?.editor.createModel(
          lib.content,
          'typescript',
          monaco.Uri.parse(lib.path),
        )
      });
    }

    /*

    AutoTypings.create(editor, {sourceCache: new LocalStorageCache()});
    const completor = new AutoImport({monaco, editor})

    completor.imports.saveFiles([{
      path: './node_modules/left-pad/index.js',
      aliases: ['left-pad'],
      imports: regexTokeniser(`
        export const PAD = ''
        export function leftPad() {}
        export function rightPad() {}
      `)
    }]);

    */
  }, [monaco, settings, libs]);

  return monaco;
}
