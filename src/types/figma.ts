export type TargetNode = (
    SceneNode
  | FrameNode
  | GroupNode
  | ComponentSetNode
  | ComponentNode
  | DocumentNode
  | any // TODO
) & ChildrenMixin;

export type SizeResult = {
  readonly width: 'full' | number | null;
  readonly height: 'full' | number | null;
}
