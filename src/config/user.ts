import type {Settings} from 'types/settings';

const user: Settings = {
  react: {
    flavor: 'react-native',
    addTranslate: false,
  },
  writer: {
    indentNumberOfSpaces: 2,
    useSingleQuote: true,
    useTabs: false,
    newLine: '\n',
  },
  monaco: {
    general: {
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
