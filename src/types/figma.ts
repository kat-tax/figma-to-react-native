export type TargetNode =
    ComponentNode
  | ComponentSetNode
  | InstanceNode
  | FrameNode
  | GroupNode
  | PageNode
  | SectionNode;

export type NodeStyles = {
  [key: string]: string | number,
};
