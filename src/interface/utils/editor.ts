// @ts-ignore
import {constrainedEditor} from 'constrained-editor-plugin';
import {AutoTypings, LocalStorageCache} from 'monaco-editor-auto-typings/custom-editor';
import type * as monaco from 'monaco-editor';

// TODO: replace with figma storage?
const sourceCache = new LocalStorageCache();
const fileRootPath = 'figma://preview/';

export type Editor = monaco.editor.IStandaloneCodeEditor;
export type Monaco = typeof monaco;

export function init(editor: Editor, monaco: Monaco) {
  // Automatically import package types
  AutoTypings.create(editor, {
    monaco,
    sourceCache,
    fileRootPath,
    shareCache: true,
    preloadPackages: true,
    versions: {
      '@types/react': '17.0.2',
      '@types/react-native': '0.72.6',
      'react-native-svg': '13.14.0',
    },
  });
  // Set up constrained editor to limit user input
  const constraint = constrainedEditor(monaco);
  constraint.initializeIn(editor);
  return constraint;
}
