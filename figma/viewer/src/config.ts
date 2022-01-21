import type {PluginSettings, CodeSettings} from 'types';

export const plugin: PluginSettings = {
  ui: {
    height: 600,
    width: 380,
  },
};

export const code: CodeSettings = {
  editor: {
    theme: 'vs',
    lineNumbers: 'off',
    minimap: {enabled: false},
    readOnly: true,
  },
  output: {
    newLine: '\r\n',
    useTabs: false,
    useSingleQuote: true,
    indentNumberOfSpaces: 2,
  },
};
