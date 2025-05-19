import type {UserSettings} from 'types/settings';

const user: UserSettings = {
  addTranslate: false,
  writer: {
    indentNumberOfSpaces: 2,
    useSingleQuote: true,
    useTabs: false,
    newLine: '\n',
  },
  monaco: {
    general: {
      fontSize: 10,
      folding: false,
      wordWrap: 'off',
      lineNumbers: 'off',
      minimap: {enabled: false},
      padding: {top: 10},
    }
  },
  esbuild: {
    format: 'esm',
  },
};

export default user;
