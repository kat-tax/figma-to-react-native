export type ComponentBuild = {
  roster: ComponentRoster,
  assets: Record<string, Uint8Array>,
  assetMap: Record<string, string>,
  pages: Array<string>,
  total: number,
  loaded: number,
  index: string,
}

export type ComponentRoster = Record<string, ComponentEntry>

export type ComponentEntry = {
  id: string,
  name: string,
  page: string,
  loading: boolean,
}

export type ComponentData = {
  id: string,
  page: string,
  name: string,
  props: string,
  code: string,
  index: string,
  story: string,
  assets: Array<[string, boolean, Uint8Array]> | null,
  links: ComponentLinks,
}

export type ComponentLinks = Record<string, string>;
