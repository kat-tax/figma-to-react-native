import type * as monaco from 'monaco-editor';

export type Editor = monaco.editor.IStandaloneCodeEditor;
export type Monaco = typeof monaco;

export async function init(_editor: Editor, _monaco: Monaco) {
  // ...
}
