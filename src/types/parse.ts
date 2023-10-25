export interface ParseData {
  root: ParseRoot,
  frame: ParseFrame | null,
  children: Array<{node: SceneNode, slug: string}>,
  tree: ParseNodeTree,
  meta: ParseMetaData,
  assets: ParseAssetData,
  variants: ParseVariantData,
  stylesheet: ParseStyleSheet,
}

export type ParseRoot = {node: ComponentNode, slug: string, click: Action};
export type ParseFrame = {node: FrameNode, slug: string};
export type ParseChild = {node: SceneNode, slug: string};

export type ParseNodeTree = Array<ParseNodeTreeItem>;
export type ParseNodeTreeItem = {node: SceneNode, children?: ParseNodeTree};

export type ParseVariantData = {
  classes: Record<string, Record<string, string>>,
  mapping: Record<string, Record<string, string>>,
};

export type ParseAssetData = Record<string, {
  name: string,
  data: string,
  width: number,
  height: number,
  bytes: Uint8Array | null,
  isVector?: boolean,
}>;

export type ParseMetaData = {
  primitives: Set<string>,
  assetNodes: Set<string>,
  styleNodes: Set<string>,
  components: Record<string, [BaseNode, BaseNode]>,
  includes: Record<string, [BaseNode, BaseNode]>,
};

export type ParseStyleSheet = Record<string, ParseStyles>;

export type ParseStyles = {
  [key: string]: string | number,
};
