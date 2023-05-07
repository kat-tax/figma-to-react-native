import type {Settings} from 'types/settings';

const config: Settings = {
  react: {
    flavor: 'react-native',
    addImport: true,
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
    loader: 'tsx',
    format: 'esm',
    define: {'process.env.NODE_ENV': 'production'},
  },
};

export default config;
