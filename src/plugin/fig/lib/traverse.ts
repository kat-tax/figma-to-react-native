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
    if (node.name.startsWith('ph:')) continue;
    const component = getComponentTarget(node);
    if (component) {
      components.add(component);
    }
  }
  return components;
}

// Find the component of a node (if exists)
export function getComponentTarget(node: SceneNode): ComponentNode {
  // Find the component in the parent chain
  let target: SceneNode = node;

  // First, check if the target is a frame
  // if so, look directly below for a component
  if (target.type === 'FRAME'
    && target.children.length > 0
    && target.children[0].type === 'COMPONENT') {
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

export function getAllIconComponents() {
  const iconPage = figma.root?.children?.find(p => p.name === 'Icons');
  const components = iconPage?.findAllWithCriteria({types: ['COMPONENT']});
  const icons = components?.filter(c => c.name.includes(':'));
  return icons;
}

export function getCollectionModes(collectionName: string) {
  const component = figma.currentPage.findAllWithCriteria({types: ['COMPONENT']})?.pop();
  if (!component) return null;
  // Find the "Theme" variable collection
  const collection = getCollectionByName(collectionName);
  if (!collection) return null;
  // Find the current and default mode
  const current = component.resolvedVariableModes[collection.id];
  const theme = figma.variables.getVariableCollectionById(collection.id);
  return {
    current: theme.modes.find(m => m.modeId === current),
    default: theme.modes.find(m => m.modeId === theme.defaultModeId),
    modes: theme.modes,
  };
}

export function getCollectionByName(collectionName: string) {
  const collections = figma.variables.getLocalVariableCollections();
  const collection = collections?.find(c => c.name === collectionName);
  return collection;
}

// Get the page of a node
export function getPage(node: BaseNode): PageNode {
  while (node.type !== 'PAGE') {
    node = node.parent;
    if (!node) return null;
  }
  return node;
}
