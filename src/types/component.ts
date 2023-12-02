export type ComponentBuild = {
  roster: ComponentRoster,
  files: Record<string, string>,
  pages: Array<string>,
  total: number,
  loaded: number,
  assets: number,
  index: string,
}

export type ComponentRoster = Record<string, ComponentEntry>

export type ComponentEntry = {
  id: string,
  key: string,
  name: string,
  page: string,
  loading: boolean,
}

export type ComponentData = {
  id: string,
  key: string,
  page: string,
  name: string,
  props: string,
  code: string,
  index: string,
  story: string,
  assets: Array<[string, Uint8Array]> | null,
  links: ComponentLinks,
}

export type ComponentLinks = Record<string, string>;
