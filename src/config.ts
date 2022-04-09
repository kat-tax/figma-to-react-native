import type {Settings} from 'types/settings';

const config: Settings = {
  display: {
    plugin: {
      height: 600,
      width: 400,
    },
    editor: {
      general: {
        theme: 'vs',
        lineNumbers: 'off',
        minimap: {enabled: false},
        padding: {top: 10},
      }
    },
  },
  output: {
    react: {
      flavor: 'react-native',
      addImport: true,
      addTranslate: false,
    },
    format: {
      indentNumberOfSpaces: 2,
      useSingleQuote: true,
      useTabs: false,
      newLine: '\n',
    },
  },
  preview: {
    transform: {
      loader: 'tsx',
      format: 'esm',
      define: {'process.env.NODE_ENV': 'production'},
    },
  },
};

export default config;
