import {registerCompletion} from 'monacopilot';
import type {Monaco, Editor} from '../';

function init(monaco: Monaco, editor: Editor) {
  registerCompletion(monaco, editor, {
    endpoint: 'https://f2rn-copilot.deno.dev',
    language: 'typescript',
    trigger: 'onTyping',
  });
}

export default {
  init,
};
