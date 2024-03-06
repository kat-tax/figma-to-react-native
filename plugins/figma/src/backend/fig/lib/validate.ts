export function validate(component: ComponentNode) {
  // Sanity check
  if (!component || component.type !== 'COMPONENT') {
    throw new Error(`Component not found.`);
  }

  // Disallow certain nodes
  if (component.findAllWithCriteria({types: ['SECTION']}).length > 0) {
    throw new Error(`Groups & sections are not supported. Convert to frames.`);
  }

  // Good to go!
  return true;
}
