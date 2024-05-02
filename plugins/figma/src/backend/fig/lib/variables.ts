export function getVariableCollection(name: string) {
  return figma.variables
    ?.getLocalVariableCollections()
    ?.find(c => c.name === name);
}

export function getVariableCollectionModes(name: string) {
  const collection = getVariableCollection(name);
  if (!collection) return null;
  const component = figma.currentPage.findAllWithCriteria({types: ['COMPONENT']})?.pop();
  const current = component?.resolvedVariableModes?.[collection.id];
  return {
    current: collection.modes.find(m => m.modeId === current),
    default: collection.modes.find(m => m.modeId === collection.defaultModeId),
    modes: collection.modes,
  };
}
