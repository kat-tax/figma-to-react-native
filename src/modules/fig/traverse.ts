// Return the selected component
export function getSelectedComponent(): ComponentNode | FrameNode {
  const {selection} = figma.currentPage;
  if (selection.length === 0) return null;
  const components = Array.from(getComponents(selection));
  return components.length > 0 ? components[0] : null;
}

// Find components in a list of nodes
export function getComponents(nodes: readonly SceneNode[]): Set<ComponentNode | FrameNode> {
  const components = new Set<ComponentNode | FrameNode>();
  for (const node of nodes) {
    const component = getComponent(node);
    if (component) {
      components.add(component);
    }
  }
  return components;
}

// Find the component of a node (if exists)
export function getComponent(node: SceneNode): ComponentNode | FrameNode {
  // Find the component in the parent chain
  let target: SceneNode = node;
  while (target.type !== 'COMPONENT_SET'
    && target.type !== 'COMPONENT'
    && target.type !== 'INSTANCE'
    && target.parent
    && target.parent.type !== 'PAGE') {
    target = target.parent as SceneNode;
  }
  // If the target is a component set, use the default variant
  if (target.type === 'COMPONENT_SET')
    return target.defaultVariant;
  // If the target is an instance, use the main component
  if (target.type === 'INSTANCE')
    return target.mainComponent;
  // If the target is a variant, use the default variant
  if (target.type === 'COMPONENT')
    return target?.parent.type === 'COMPONENT_SET'
      ? target.parent.defaultVariant
      : target;
  return null;
  // TODO: Fallback to frame search
  // return getFrame(target);
}

// Find the frame of a node
export function getFrame(node: SceneNode): FrameNode {
  // Find the component in the parent chain
  let target: SceneNode = node;
  while (target.type !== 'FRAME'
    && target.parent
    && target.parent.type !== 'PAGE') {
    target = target.parent as SceneNode;
  }
  // If the target is a component set, use the default variant
  if (target.type === 'FRAME')
    return target;
  // Return null otherwise
  return null;
}

// Get the page of a node
export function getPage(node: BaseNode): PageNode {
  while (node.type !== 'PAGE') {
    node = node.parent;
    if (!node) return null;
  }
  return node;
}

// Go to the component's page and focus it
export function focusComponent(id: string) {
  try {
    const node = figma.getNodeById(id);
    if (node) {
      const page = getPage(node);
      if (page && figma.currentPage !== page) {
        figma.currentPage = page;
      }
      figma.currentPage.selection = [node as any];
      figma.viewport.scrollAndZoomIntoView([node]);
    }
  } catch (e) {}
}
