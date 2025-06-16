import type {ComponentRosterEntry} from 'types/component';

export type ProjectComponentLayout = 'grid' | 'list';
export type ProjectComponentIndex = Record<string, ProjectComponentEntry[]>;
export type ProjectComponentEntry = {
  item: ComponentRosterEntry & {key: string},
  positions: Set<number>,
}

export interface ProjectConfig {
  name: string,
  apiKey: string,
  docKey: string,
  gitKey: string,
  gitRepo: string,
  gitBranch: string,
}

export interface ProjectExport {
  method: ProjectExportMethod,
}

export type ProjectExportMethod =
  | 'git'
  | 'zip'
  | 'run'
  | 'npm'

export interface ProjectInfo {
  appConfig: {
    [group: string]: {
      [key: string]: string | number | boolean}
    },
  locales: {
    source: string,
    all: Array<[string, string]>,
  },
}

export interface ProjectIcons {
  sets: string[],
  list: string[],
  maps: Record<string, string>,
  names: Record<string, string>,
}

export interface ProjectBuild {
  name: string,
  time: number,
  index: string,
  theme: string,
  assets: ProjectBuildAssets,
  components: ProjectBuildComponents,
}

export type ProjectBuildAssets = Array<[
  string,
  boolean,
  Uint8Array,
]>;

export type ProjectBuildComponents = Array<[
  string,
  string,
  string,
  string,
  string,
  string,
]>;
