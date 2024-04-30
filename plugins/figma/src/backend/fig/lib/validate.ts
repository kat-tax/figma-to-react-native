export function validate(component: ComponentNode) {
  // Sanity check
  if (!component || component.type !== 'COMPONENT') {
    throw new Error(`Component not found.`);
  }

  // Disallow certain nodes
  if (component.findAllWithCriteria({types: ['SECTION']}).length > 0) {
    throw new Error(`Sections cannot be inside a component. Convert them to a frame.`);
  }

  // Good to go!
  return true;
}
