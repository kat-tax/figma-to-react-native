import {useEffect} from 'preact/hooks';
import {useMonaco} from '@monaco-editor/react';
import {emit} from '@create-figma-plugin/utilities';
import schema from 'schemas/settings.json';
import libraries from 'interface/utils/libraries';

import type * as monaco from 'monaco-editor';
import type {Settings} from 'types/settings';
import type {EventFocus} from 'types/events';
import type {PreviewEditorLinks} from 'types/preview';

export function useEditor(settings: Settings, links?: PreviewEditorLinks) {
  const monaco = useMonaco();

  // Setup linking to components
  useEffect(() => {
    return monaco?.languages.registerDefinitionProvider('typescript', {
      provideDefinition: (model, position) => {
        // Find a subcomponent link
        const link = links?.[model.getWordAtPosition(position).word];
        if (link) {
          emit<EventFocus>('FOCUS', link);
          return [{
            uri: monaco.Uri.parse(link),
            range: new monaco.Range(1, 1, 1, 1),
          }];
        }
        return [];
      }
    }).dispose;
  }, [monaco, links]);

  // Setup JSON schema
  useEffect(() => {
    const json = monaco?.languages.json.jsonDefaults;
    json?.setDiagnosticsOptions({
      validate: true,
      schemas: [{
        schema,
        fileMatch: [monaco?.Uri.parse('figma://model/settings.json').toString()],
        uri: 'http://fig.run/schema-settings.json',
      }],
    });
  }, [monaco]);

  // Setup typescript user options + libraries
  useEffect(() => {
    if (!monaco) return;
  
    const ts = monaco.languages.typescript.typescriptDefaults;
    ts?.setInlayHintsOptions(settings.monaco.inlayHints);
    ts?.setDiagnosticsOptions(settings.monaco.diagnostics);
    ts?.setCompilerOptions({
      ...settings.monaco.compiler,
      jsx: monaco.languages.typescript.JsxEmit.ReactNative,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      paths: {
        ['components/*']: ['figma://model/*'],
      }
    });

    const libs = Object.keys(libraries);
    libs.forEach((key) => {
      monaco.editor.createModel(
        libraries[key],
        'typescript',
        monaco.Uri.parse(key),
      );
    });
    ts?.setExtraLibs(libs.map((key) => ({
      filePath: key,
      content: libraries[key],
    })));
  }, [monaco, settings]);

  return monaco;
}
