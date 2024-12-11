import {registerCompletion} from 'monacopilot';
import type {Monaco, Editor} from '../';

function init(monaco: Monaco, editor: Editor) {
  registerCompletion(monaco, editor, {
    endpoint: 'https://api.example.com/complete',
    language: 'typescript',
  });
}

export default {
  init,
};
