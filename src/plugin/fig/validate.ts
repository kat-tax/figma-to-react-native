export function validate(node: SceneNode) {
  // Disallow non-component nodes
  if (node.type !== 'COMPONENT') {
    throw new Error('Only components are supported.');
  }

  // Disallow groups, they mess up the layout
  if (node.findAllWithCriteria({types: ['GROUP']})) {
    throw new Error('Groups are not supported, please convert them to frames.');
  }
  return true;
}
