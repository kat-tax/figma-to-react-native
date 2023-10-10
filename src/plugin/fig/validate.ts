export function validate(component: ComponentNode) {
  // Sanity check
  if (!component || component.type !== 'COMPONENT') {
    throw new Error(`Component not found.`);
  }

  // Disallow groups and sections, not worth the hassle
  if (component.findAllWithCriteria({types: ['GROUP', 'SECTION']}).length > 0) {
    throw new Error(`Groups & sections are not supported. Convert to frames.`);
  }

  // Good to go!
  return true;
}
