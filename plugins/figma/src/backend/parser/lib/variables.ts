import type {VariableModes} from 'types/figma';

export async function getVariableCollectionModes(collection: string | VariableCollection): Promise<VariableModes | null> {
  let collectionData: VariableCollection;
  if (typeof collection === 'string')
    collectionData = await getVariableCollection(collection);
  else
    collectionData = collection;
  if (!collectionData)
    return null;
  const component = figma.currentPage.findAllWithCriteria({types: ['COMPONENT']})?.pop();
  const current = component?.resolvedVariableModes?.[collectionData.id];
  return {
    current: collectionData.modes.find(m => m.modeId === current),
    default: collectionData.modes.find(m => m.modeId === collectionData.defaultModeId),
    modes: collectionData.modes,
  };
}

export async function getVariables(ids: string[]) {
  return await Promise.all(ids.map(id =>
    figma.variables.getVariableByIdAsync(id)));
}

export async function getVariableCollection(name: string) {
  return (await figma.variables?.getLocalVariableCollectionsAsync())
    ?.find(c => c.name === name);
}
