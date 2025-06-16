import type {Monaco, MonacoEditor} from '../monaco';

export const actions = [
  'apply',
  'view diff',
  'reset',
];

export async function diff(action: string) {
  switch (action) {
    case 'View Diff':
      console.log('[diff]', action);
      break;
    case 'Apply':
      confirm('Are you sure you want to apply the component code changes?');
      break;
    case 'reset':
      confirm('Are you sure you want to clear the code changes?');
      break;
    }
}

export function init(monaco: Monaco, editor: MonacoEditor, run: () => void) {
  editor.addAction({
    id: 'f2rn-diff-init',
    label: 'View Diff',
    contextMenuGroupId: '10_versioning',
    contextMenuOrder: 99,
    precondition: null,
    keybindingContext: null,
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyJ],
    run,
  });
}

export function exit(editor: MonacoEditor, monaco: Monaco, run: () => void) {
  editor.addAction({
    id: 'f2rn-diff-exit',
    label: 'Exit Diff',
    contextMenuGroupId: '10_versioning',
    contextMenuOrder: 99,
    precondition: null,
    keybindingContext: null,
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyJ],
    run,
  });
}

export default {
  actions,
  diff,
  init,
  exit,
};
