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
  icons: {list: string[], count: Record<string, number>},
  fonts: {list: string[]},
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
  preview: Uint8Array,
  hasError?: boolean,
  errorMessage?: string,
}

export type ComponentData = {
  // Meta
  info: ComponentInfo,
  links: ComponentLinks,
  height: number,
  width: number,
  // Text
  imports: string,
  props: string,
  code: string,
  index: string,
  story: string,
  docs: string,
  // Data
  assets: ComponentAsset[] | null,
  icons: {
    list: string[],
    count: Record<string, number>,
  },
  fonts: {
    list: string[],
  },
}

export type ComponentAsset = {
  id: string,
  name: string,
  width: number,
  height: number,
  parent: string,
  bytes: Uint8Array,
  isVector?: boolean,
}

export type ComponentLinks = Record<string, string>;
