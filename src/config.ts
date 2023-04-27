import type {Settings} from 'types/settings';

const config: Settings = {
  display: {
    plugin: {
      width: 400,
      height: 600,
      themeColors: true,
    },
    editor: {
      general: {
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
