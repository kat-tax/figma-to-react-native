import {TargetNode, NodeStyles} from 'types/figma';

export interface ParseData {
  root: {node: TargetNode, styles: NodeStyles, slug: string},
  children: Array<{node: SceneNode, styles: NodeStyles, slug: string}>,
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
