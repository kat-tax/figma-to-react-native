export type ComponentBuild = {
  roster: ComponentRoster,
  assets: Record<string, ComponentAsset>,
  assetMap: Record<string, string>,
  icons: string[],
  pages: string[],
  links: ComponentLinks,
  total: number,
  loaded: number,
  index: string,
}

export type ComponentRoster = Record<string, ComponentEntry>

export type ComponentEntry = {
  id: string,
  key: string,
  name: string,
  page: string,
  loading: boolean,
  preview: string,
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
  width: number,
  height: number,
  icons: string[],
  assets: ComponentAsset[] | null,
  links: ComponentLinks,
}

export type ComponentAsset = {
  name: string,
  hash: string,
  width: number,
  height: number,
  embed: string,
  bytes: Uint8Array,
  isVector?: boolean,
}

export type ComponentLinks = Record<string, string>;
