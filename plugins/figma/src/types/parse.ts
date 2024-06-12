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
  assetMap: Record<string, string>,
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
  name: string,
  hash: string,
  width: number,
  height: number,
  thumbhash: string,
  bytes: Uint8Array | null,
  rawName: string,
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
