export type ComponentInfo = {
  target: ComponentSetNode | ComponentNode,
  name: string,
  path: string,
  page: PageNode,
  section: SectionNode,
  propDefs: ComponentPropertyDefinitions,
  isVariant: boolean,
  isInstance: boolean,
  hasError?: boolean,
  errorMessage?: string,
}

export type ComponentBuild = {
  roster: ComponentRoster,
  assets: Record<string, ComponentAsset>,
  assetMap: Record<string, string>,
  icons: {list: string[], count: Record<string, number>},
  pages: string[],
  links: ComponentLinks,
  total: number,
  loaded: number,
  index: string,
}

export type ComponentRoster = Record<string, ComponentRosterEntry>
export type ComponentRosterEntry = {
  id: string,
  name: string,
  page: string,
  path: string,
  loading: boolean,
  preview: string,
  hasError?: boolean,
  errorMessage?: string,
}

export type ComponentData = {
  id: string,
  key: string,
  props: string,
  imports: string,
  code: string,
  index: string,
  story: string,
  docs: string,
  width: number,
  height: number,
  icons: {list: string[], count: Record<string, number>},
  assets: ComponentAsset[] | null,
  links: ComponentLinks,
  info: ComponentInfo,
}

export type ComponentAsset = {
  name: string,
  hash: string,
  width: number,
  height: number,
  bytes: Uint8Array,
  isVector?: boolean,
}

export type ComponentLinks = Record<string, string>;
