export type ExportFormState = {
  method: ExportMethod,
  scope: ExportScope,
  package: boolean,
  packageName: string,
  apiKey: string,
  includeFrame: boolean,
  autoTranslate: boolean,
  optimizeAssets: boolean,
};

export type ExportMethod = 'zip' | 'storybook' | 'publish';
export type ExportScope = 'all' | 'page' | 'selected';
export type ExportMode = 'code' | 'preview';
