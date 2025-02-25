export interface ProjectBuild {
  name: string,
  time: number,
  index: string,
  theme: string,
  assets: ProjectBuildAssets,
  components: ProjectBuildComponents,
}

export interface ProjectInfo {
  appConfig: {
    [group: string]: {
      [key: string]: string | number | boolean}
    },
  locales: {
    source: string,
    all: Array<[string, string]>,
  },
  translations: {
    [locale: string]: {
      [key: string]: string,
    },
  },
}

export interface ProjectIcons {
  sets: string[],
  list: string[],
  map: Record<string, string>,
}

export type ProjectBuildAssets = Array<[string, boolean, Uint8Array]>;
export type ProjectBuildComponents = Array<[string, string, string, string, string, string]>;

export interface ProjectRelease {
  method: ProjectExportMethod,
  scope: ProjectExportScope,
  apiKey: string,
  docKey: string,
  gitKey: string,
  gitRepo: string,
  gitBranch: string,
  enableAssetOptimizations: boolean,
  includeAssets: boolean,
  includeTemplate: boolean,
}

export type ProjectExportScope =
  | 'document'
  | 'page'
  | 'selected';

export type ProjectExportMethod =
  | 'download'
  | 'push'
  | 'sync'
  | 'preview'
  | 'release';
