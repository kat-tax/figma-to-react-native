// import {AutoTypings, LocalStorageCache} from 'monaco-editor-auto-typings/custom-editor';

import type * as monaco from 'monaco-editor';

export type Editor = monaco.editor.IStandaloneCodeEditor;
export type Monaco = typeof monaco;

// const sourceCache = new LocalStorageCache();

export async function initEditor(editor: Editor, _monaco: Monaco) {
  // AutoTypings.create(editor, {monaco, sourceCache, fileRootPath: './'});
  // editor.setValue(contents);
}
