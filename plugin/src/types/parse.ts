export interface ParseData {
  frame: ParseFrame | null,
  root: ParseRoot,
  tree: ParseNodeTree,
  meta: ParseMetaData,
  children: Array<{node: SceneNode, slug: string}>,
  variants: ParseVariantData,
  stylesheet: ParseStyleSheet,
  localState: ParseLocalState,
  assetData: ParseAssetData,
}

export type ParseRoot = {
  node: ComponentNode,
  slug: string,
  click: Action,
};

export type ParseFrame = {
  node: FrameNode,
  slug: string,
};

export type ParseChild = {
  node: SceneNode,
  slug: string,
};

export type ParseNodeTree = Array<ParseNodeTreeItem>;
export type ParseNodeTreeItem = {
  node: SceneNode,
  children?: ParseNodeTree,
};

export type ParseVariantData = {
  mapping: Record<string, Record<string, string>>,
  classes: Record<string, Record<string, string>>,
  icons: Record<string, Record<string, ParseIconData>>,
};

export type ParseAssetData = Record<string, {
  id: string,
  name: string,
  rawName: string,
  parent: string,
  width: number,
  height: number,
  bytes: Uint8Array | null,
  thumb: string | null,
  isVector?: boolean,
  isVideo?: boolean,
}>;

export type ParseIconData = {
  name: string,
  color: string,
  size: number,
};

export type ParseMetaData = {
  assetNodes: Set<string>,
  styleNodes: Set<string>,
  iconsUsed: Set<string>,
  fontsUsed: Set<string>,
  iconCounts: Record<string, number>,
  components: Record<string, [BaseNode, BaseNode]>,
  includes: Record<string, [BaseNode, BaseNode]>,
  icons: Record<string, ParseIconData>,
};

export type ParseLocalState = {
  [page: string]: {
    [component: string]: Array<[string, VariableValue]>,
  },
};

export type ParseStyleSheet = Record<string, ParseStyles>;
export type ParseStyles = {
  [key: string]: string | number,
};
