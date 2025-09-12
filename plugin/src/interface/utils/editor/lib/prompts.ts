import type {Monaco, MonacoEditor} from '../monaco';

export const actions = [
  'apply',
  'view diff',
  'reset',
];

export async function patch(action: string) {
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
  // TODO: experimental, little use case atm
  return;
  editor.addAction({
    id: 'f2rn-gpt',
    label: 'Patch with GPT-4',
    contextMenuGroupId: '1_modification',
    contextMenuOrder: 99,
    precondition: null,
    keybindingContext: null,
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG],
    run,
  });
}

export default {
  actions,
  patch,
  init,
};
