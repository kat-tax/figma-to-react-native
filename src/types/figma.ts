export type TargetNode =
    ComponentNode
  | ComponentSetNode
  | InstanceNode
  | FrameNode
  | GroupNode
  | PageNode
  | SectionNode;

export type NodeStyles = {
  [key: string]: string | number
};

export interface ParseData {
  root: {node: TargetNode, styles: NodeStyles},
  children: Array<{node: SceneNode, styles: NodeStyles}>,
  tree: ParseNodeTree,
  meta: ParseMetaData,
  assets: ParseAssetData,
  variants: ParseVariantData,
}

export type ParseNodeTree = Array<ParseNodeTreeItem>;
export type ParseNodeTreeItem = {node: SceneNode, children?: ParseNodeTree};
export type ParseVariantData = Record<string, Record<string, unknown>>;
export type ParseAssetData = Record<string, {width: number, height: number, data: string}>;
export type ParseMetaData = {
  primitives: Set<string>,
  assetNodes: Set<string>,
  components: Record<string, BaseNode>,
  includes: Record<string, BaseNode>,
};
