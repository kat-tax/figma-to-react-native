export interface ProjectBuild {
  name: string,
  time: number,
  index: string,
  theme: string,
  assets: ProjectBuildAssets,
  components: ProjectBuildComponents,
}

export interface ProjectIcons {
  sets: string[],
  list: string[],
  map: Record<string, string>,
}

export type ProjectBuildAssets = Array<[string, boolean, Uint8Array]>;
export type ProjectBuildComponents = Array<[string, string, string, string, string]>;

export interface ProjectRelease {
  method: ProjectExportMethod,
  scope: ProjectExportScope,
  apiKey: string,
  docKey: string,
  packageName: string,
  packageVersion: string,
  enableAssetOptimizations: boolean,
  includeAssets: boolean,
  links?: ProjectLinks,
}

export interface ProjectLinks {
  documentation?: string,
  storybook?: string,
  discord?: string,
  github?: string,
  figma?: string,
  x?: string,
}

export type ProjectExportScope = 'document' | 'page' | 'selected';
export type ProjectExportMethod = 'download' | 'preview' | 'release';
