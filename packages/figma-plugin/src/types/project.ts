export interface ProjectBuild {
  id: string,
  name: string,
  index: string,
  theme: string,
  assets: ProjectBuildAssets,
  components: ProjectBuildComponents,
  package?: ProjectBuildPackage,
}

export type ProjectBuildAssets = Array<[string, Uint8Array]>;
export type ProjectBuildComponents = Array<[string, string, string, string]>;
export type ProjectBuildPackage = {
  name: string,
  version: string,
  registry?: 'npm',
};

export interface ProjectConfig {
  method: ProjectExportMethod,
  scope: ProjectExportScope,
  apiKey: string,
  docKey: string,
  isPackage: boolean,
  packageName: string,
  packageVersion: string,
  enableAutoTranslations: boolean,
  enableAssetOptimizations: boolean,
  includeFrames: boolean,
}

export type ProjectExportScope = 'document' | 'page' | 'selected';
export type ProjectExportMethod = 'download' | 'preview' | 'release';
