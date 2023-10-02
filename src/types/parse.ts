export interface ParseData {
  root: {node: ComponentNode, slug: string, styles: ParseStyles, click: Action},
  frame: {node: FrameNode, slug: string, styles: ParseStyles},
  children: Array<{node: SceneNode, slug: string, styles: ParseStyles}>,
  tree: ParseNodeTree,
  meta: ParseMetaData,
  assets: ParseAssetData,
  variants: ParseVariantData,
}

export type ParseNodeTree = Array<ParseNodeTreeItem>;
export type ParseNodeTreeItem = {node: SceneNode, children?: ParseNodeTree};
export type ParseVariantData = Record<string, Record<string, unknown>>;
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
  components: Record<string, [BaseNode, BaseNode]>,
  includes: Record<string, [BaseNode, BaseNode]>,
};

export type ParseStyles = {
  [key: string]: string | number,
};
