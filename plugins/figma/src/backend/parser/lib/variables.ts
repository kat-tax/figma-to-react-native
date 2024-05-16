export async function getVariables(ids: string[]) {
  return await Promise.all(ids.map(id =>
    figma.variables.getVariableByIdAsync(id)));
}

export async function getVariableCollection(name: string) {
  return (await figma.variables?.getLocalVariableCollectionsAsync())
    ?.find(c => c.name === name);
}

export async function getVariableCollectionModes(name: string) {
  const collection = await getVariableCollection(name);
  if (!collection) return null;
  const component = figma.currentPage.findAllWithCriteria({types: ['COMPONENT']})?.pop();
  const current = component?.resolvedVariableModes?.[collection.id];
  return {
    current: collection.modes.find(m => m.modeId === current),
    default: collection.modes.find(m => m.modeId === collection.defaultModeId),
    modes: collection.modes,
  };
}
