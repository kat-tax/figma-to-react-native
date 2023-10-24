// @ts-ignore
import {constrainedEditor} from 'constrained-editor-plugin';
import type * as monaco from 'monaco-editor';

export type Editor = monaco.editor.IStandaloneCodeEditor;
export type Monaco = typeof monaco;

export function init(editor: Editor, monaco: Monaco) {
  const constraint = constrainedEditor(monaco);
  constraint.initializeIn(editor);
  constraint.toggleDevMode();
  return constraint;
}
