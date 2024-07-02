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
      lineNumbers: 'off',
      wordWrap: 'off',
      fontSize: 11,
      minimap: {enabled: false},
      padding: {top: 10},
    }
  },
  esbuild: {
    format: 'esm',
  },
};

export default user;
