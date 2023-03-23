import {useEffect} from 'react';
import {useMonaco} from '@monaco-editor/react';
import settingsSchema from 'interface/templates/schema.json';

// import AutoImport, {regexTokeniser} from '@blitz/monaco-auto-import'
// import {AutoTypings, LocalStorageCache} from 'monaco-editor-auto-typings';

import type {Settings} from 'types/settings';
import type {EditorLibrary, EditorLinks} from 'types/editor';

export function useEditor(settings: Settings, links?: EditorLinks, libs?: EditorLibrary[]) {
  const monaco = useMonaco();

  // TODO when we do find a link, remove the "ctrl" to go to definition hotkey until a "keyup" ctrl event is fired
  useEffect(() => {
    return monaco?.languages.registerDefinitionProvider('typescript', {
      provideDefinition: (model, position) => {
        const link = links?.[model.getWordAtPosition(position).word];
        if (link) {
          parent.postMessage({pluginMessage: {type: 'focus', payload: link}}, '*');
          return [];
        }
        return null;
      }
    }).dispose;
  }, [links]);

  useEffect(() => {
    // Setup settings schema + validation
    const json = monaco?.languages.json.jsonDefaults;
    json?.setDiagnosticsOptions({
      validate: true,
      schemas: [{
        schema: settingsSchema,
        fileMatch: [monaco?.Uri.parse('Settings.json').toString()],
        uri: 'http://ult.dev/figaro-settings-schema.json',
      }],
    });

    // Setup typescript options and libs
    const typescript = monaco?.languages.typescript.typescriptDefaults;
    typescript?.setCompilerOptions(settings.display.editor.compiler);
    typescript?.setInlayHintsOptions(settings.display.editor.inlayHints);
    typescript?.setDiagnosticsOptions(settings.display.editor.diagnostics);
    if (libs) {
      typescript?.setExtraLibs(libs);
      libs.forEach((lib) => {
        monaco?.editor.createModel(lib.content, 'typescript', monaco.Uri.parse(lib.path))
      });
    }

    /*

      // Automatic types for packages (EXPERIMENTAL)
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
