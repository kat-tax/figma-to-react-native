export type TargetNode =
  | SceneNode
  | FrameNode
  | GroupNode
  | ComponentSetNode
  | ComponentNode
  | DocumentNode & ChildrenMixin;

export function getSelection() {
  const {selection} = figma.currentPage;
  if (selection.length === 0) return null;
  let root: TargetNode = selection[0];
  if (root.type === 'COMPONENT') return selection[0];
  while (root.parent && root.parent.type !== 'PAGE') {
    root = root.parent;
    if (root.type === 'COMPONENT') return root;
  }
  return null;
}

export const hasChildren = (node: unknown): node is ChildrenMixin =>
  !!(node && (node as any).children);

export const isGroupNode = (node: unknown): node is GroupNode =>
  !!(node && (node as any).type === "GROUP");

export const getLayout = (node: SceneNode) => {
  // Simple single layer group wrapping we can ignore
  if (isGroupNode(node) && node.children?.length === 1) {
    return "column";
  }

  if ((node as FrameNode).layoutMode === "VERTICAL") {
    return "column";
  }
  if ((node as FrameNode).layoutMode === "HORIZONTAL") {
    return "row";
  }
  return "unknown";
}

