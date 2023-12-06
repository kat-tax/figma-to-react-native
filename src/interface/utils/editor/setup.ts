import {emit} from '@create-figma-plugin/utilities';
// @ts-ignore
import {constrainedEditor} from 'constrained-editor-plugin';
import {AutoTypings, LocalStorageCache} from 'monaco-editor-auto-typings/custom-editor';
import {F2RN_EDITOR_NS} from 'config/env';
import libraries from 'interface/utils/libraries';
import schema from 'schemas/settings.json';

import type * as monaco from 'monaco-editor';
import type {ComponentLinks} from 'types/component';
import type {EventFocusNode} from 'types/events';
import type {Settings} from 'types/settings';

const sourceCache = new LocalStorageCache();

export type Editor = monaco.editor.IStandaloneCodeEditor;
export type Monaco = typeof monaco;

export function setupComponentEditor(editor: Editor, monaco: Monaco) {
  // Automatically import package types
  AutoTypings.create(editor, {
    monaco,
    sourceCache,
    shareCache: true,
    preloadPackages: true,
    fileRootPath: F2RN_EDITOR_NS,
    versions: {
      '@types/react': '17.0.2',
      '@types/react-native': '0.72.6',
      'react-native-svg': '13.14.0',
    },
  });

  // Setup constrained editor to limit user input
  const constraint = constrainedEditor(monaco);
  constraint.initializeIn(editor);

  // Setup custom commands
  editor.addAction({
    id: 'f2rn-gpt4v',
    label: 'Patch with GPT4',
    contextMenuGroupId: '1_modification',
    contextMenuOrder: 99,
    precondition: null,
    keybindingContext: null,
    keybindings: [
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG,
    ],
    run: (editor) => {
      alert("i'm running => " + editor.getPosition());
      editor.trigger('custom', 'myCustomCommand', {});
    },
  });

  return constraint;
}

export function setupTypescript(monaco: Monaco, settings: Settings) {
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
      ['components/*']: [`${F2RN_EDITOR_NS}*`],
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
}

export function setupFileOpener(monaco: Monaco, links?: ComponentLinks) {
  return monaco.editor.registerEditorOpener({
    openCodeEditor(_source, resource, _selectionOrPosition) {
      const base = `${resource.scheme}://${resource.authority}/`;
      if (base === F2RN_EDITOR_NS) {
        const name = resource.path.match(/\/([^\/]+)\.[^.]+$/)?.[1];
        const link = links?.[name];
        console.log('openCodeEditor', resource, name, links, link);
        if (link) {
          emit<EventFocusNode>('FOCUS', link);
        }
      }
      return false;
    }
  }).dispose;
}

export function setupSettingsSchema(monaco: Monaco) {
  const json = monaco.languages.json.jsonDefaults;
  json?.setDiagnosticsOptions({
    validate: true,
    schemas: [{
      schema,
      uri: 'http://fig.run/schema-settings.json',
      fileMatch: [
        monaco?.Uri.parse(`${F2RN_EDITOR_NS}settings.json`).toString(),
      ],
    }],
  });
}
