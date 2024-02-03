// @ts-ignore No types
import {constrainedEditor} from 'constrained-editor-plugin';
import type {Monaco, Editor} from 'interface/utils/editor';

export function init(monaco: Monaco, editor: Editor) {
  const constraint = constrainedEditor(monaco);
  constraint.initializeIn(editor);
  return constraint;
}

export default {
  init,
};
