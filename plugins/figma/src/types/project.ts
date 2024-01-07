export interface ProjectBuild {
  id: string,
  name: string,
  index: string,
  theme: string,
  assets: ProjectBuildAssets,
  components: ProjectBuildComponents,
  package?: ProjectBuildPackage,
}

export interface ProjectIcons {
  sets: string[],
  list: string[],
  map: Record<string, string>,
}

export type ProjectBuildAssets = Array<[string, boolean, Uint8Array]>;
export type ProjectBuildComponents = Array<[string, string, string, string]>;
export type ProjectBuildPackage = {
  name: string,
  version: string,
  registry?: 'npm',
};

export interface ProjectRelease {
  method: ProjectExportMethod,
  scope: ProjectExportScope,
  apiKey: string,
  docKey: string,
  packageName: string,
  packageVersion: string,
  enableAutoTranslations: boolean,
  enableAssetOptimizations: boolean,
  includeAssets: boolean,
}

export type ProjectExportScope = 'document' | 'page' | 'selected';
export type ProjectExportMethod = 'download' | 'preview' | 'release';
