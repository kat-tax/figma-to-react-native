import * as consts from 'config/consts';

// Return the selected component
export function getSelectedComponent(): ComponentNode {
  const {selection} = figma.currentPage;
  if (selection.length === 0) return null;
  const components = Array.from(getComponentTargets(selection));
  return components.length > 0 ? components[0] : null;
}

// Find components in a list of nodes
export function getComponentTargets(nodes: readonly SceneNode[]): Set<ComponentNode> {
  const components = new Set<ComponentNode>();
  for (const node of nodes) {
    const component = getComponentTarget(node);
    if (component && getPage(component)?.name !== consts.PAGES_SPECIAL.ICONS) {
      components.add(component);
    }
  }
  return components;
}

// Find the component of a node (if exists)
export function getComponentTarget(node: SceneNode): ComponentNode {
  // Find the component in the parent chain
  let target: SceneNode = node;

  if (!target) return null;

  // First, check if the target is a frame
  // if so, look directly below for a component
  if (target.type === 'FRAME'
    && target.children?.length > 0
    && target.children[0]?.type === 'COMPONENT') {
    return target.children[0];
  }

  // If not, search parent nodes for a component
  while (target.type !== 'COMPONENT_SET'
    && target.type !== 'COMPONENT'
    && target.type !== 'INSTANCE'
    && target.parent
    && target.parent.type !== 'PAGE') {
    target = target.parent as SceneNode;
  }

  // Find a top level component (if exists)
  const parentComponent = getComponentParent(node);
  if (parentComponent)
    return parentComponent;

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
}

// Find the parent component of a component instance
export function getComponentParent(node: SceneNode): ComponentNode {
  // Find the component in the parent chain
  let target: SceneNode = node;
  if (!target) return null;
  while (target.type !== 'COMPONENT_SET'
    && target.type !== 'COMPONENT'
    && target.parent
    && target.parent.type !== 'PAGE') {
    target = target.parent as SceneNode;
  }
  // If the target is a component set, use the default variant
  if (target.type === 'COMPONENT_SET')
    return target.defaultVariant;
  // If the target is a variant, use the default variant
  if (target.type === 'COMPONENT')
    return target?.parent.type === 'COMPONENT_SET'
      ? target.parent.defaultVariant
      : target;
  return null;
}

// Find the section of a node
export function getSection(node: BaseNode): SectionNode {
  let target: BaseNode = node;
  if (!target) return null;
  while (target.type !== 'SECTION') {
    target = target.parent;
    if (!target) return null;
  }
  return target;
}

// Get the page of a node
export function getPage(node: BaseNode): PageNode {
  if (!node) return null;
  while (node.type !== 'PAGE') {
    node = node.parent;
    if (!node) return null;
  }
  return node;
}

// Focus a node (and go to the page it's on)
export async function focusNode(id: string) {
  try {
    const node = figma.getNodeById(id);
    if (node) {
      const page = getPage(node);
      if (page && figma.currentPage !== page)
        await figma.setCurrentPageAsync(page);
      figma.currentPage.selection = [node as SceneNode];
      figma.viewport.scrollAndZoomIntoView([node]);
    }
  } catch (e) {}
}