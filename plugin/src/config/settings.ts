import type {ProjectSettings} from 'types/settings';

export default <ProjectSettings> {
  projectToken: '',
  translate: false,
  writer: {
    indentNumberOfSpaces: 2,
    useSingleQuote: true,
    useTabs: false,
    newLine: '\n',
  },
  git: {
    repo: '',
    branch: '',
    accessToken: '',
  },
  monaco: {
    general: {
      fontSize: 11,
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
}
