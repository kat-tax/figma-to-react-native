// @ts-ignore No types
import {constrainedEditor} from 'constrained-editor-plugin';
import {AutoTypings, LocalStorageCache} from 'monaco-editor-auto-typings/custom-editor';
import {emit} from '@create-figma-plugin/utilities';
import {F2RN_EDITOR_NS} from 'config/env';
import * as $ from 'interface/store';

// @ts-ignore
import schema from 'interface/schemas/user/schema.json';
import templates from './templates';

import type * as monaco from 'monaco-editor';
import type {UserSettings} from 'types/settings';
import type {EventFocusNode} from 'types/events';
import type {ComponentLinks} from 'types/component';

const sourceCache = new LocalStorageCache();

export type Editor = monaco.editor.IStandaloneCodeEditor;
export type Monaco = typeof monaco;

export function initTypescript(monaco: Monaco, settings: UserSettings) {
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
      ['theme']: [`${F2RN_EDITOR_NS}theme.ts`],
    }
  });

  // Add theme file
  const theme = $.getProjectTheme().toString();
  if (theme) {
    const uri = monaco.Uri.parse(`${F2RN_EDITOR_NS}theme.ts`);
    const model = monaco.editor.getModel(uri);
    if (!model) {
      monaco.editor.createModel(theme, 'typescript', uri);
    } else {
      model.setValue(theme);
    }
  }

  // Add library files
  Object.keys(templates).forEach(key => {
    const uri = monaco.Uri.parse(key);
    if (!monaco.editor.getModel(uri)) {
      monaco.editor.createModel(templates[key], 'typescript', uri);
    }
  });
}

export function initFileOpener(monaco: Monaco, links?: ComponentLinks) {
  const regexTestId = /testID=(?:"(\d+:\d+)"|{(props\.testID)})/;
  const regexComponentName = /\/([^\/]+)\.[^.]+$/;
  return monaco.editor.registerEditorOpener({
    openCodeEditor(source, resource) {
      let nodeId: string | undefined;
      const base = `${resource.scheme}://${resource.authority}/`;
      if (base === F2RN_EDITOR_NS) {
        // Search for component name in links
        nodeId = links?.[resource.path?.match(regexComponentName)?.[1]];
        // Search for test ids if no component name found
        if (!nodeId) {
          const sel = source.getSelection();
          const model = source.getModel();
          for (let i = sel.startLineNumber; i <= sel.endLineNumber; i++) {
            const line = model?.getLineContent(i);
            const match = line?.match(regexTestId);
            const [_, literal, prop] = match;
            nodeId = prop
              ? links?.[model.uri.path?.match(regexComponentName)?.[1]]
              : literal;
          }
        }
      }
      // Focus node in editor
      // TODO: support multiple nodes
      if (nodeId) {
        emit<EventFocusNode>('FOCUS', nodeId);
      }
      console.debug('[open file]', {resource, base, nodeId, links, source});
      return false;
    }
  }).dispose;
}

export function initSettingsSchema(monaco: Monaco) {
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

export function initComponentEditor(
  editor: Editor,
  monaco: Monaco,
  onTriggerGPT: () => void,
) {
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
      'react-native-unistyles': '2.1.1',
      'react-native-svg': '13.14.0',
      'react-native-exo': '0.9.8',
    },
  });

  // Setup constrained editor to limit user input
  const constraint = constrainedEditor(monaco);
  constraint.initializeIn(editor);

  // Setup custom commands
  editor.addAction({
    id: 'f2rn-gpt',
    label: 'Patch with GPT-4',
    contextMenuGroupId: '1_modification',
    contextMenuOrder: 99,
    precondition: null,
    keybindingContext: null,
    keybindings: [
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG,
    ],
    run: () => {
      onTriggerGPT();
    },
  });

  return constraint;
}
