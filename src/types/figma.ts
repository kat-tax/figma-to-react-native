export type TargetNode = (
    SceneNode
  | FrameNode
  | GroupNode
  | ComponentSetNode
  | ComponentNode
  | DocumentNode
  | any // TODO
) & ChildrenMixin;
