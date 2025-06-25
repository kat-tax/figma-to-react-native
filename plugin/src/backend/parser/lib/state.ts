import * as consts from 'config/consts';
import {getVariableCollection} from './variables';

import type {ParseLocalState} from 'types/parse';

export async function getLocalState(): Promise<ParseLocalState> {
  const state = await getVariableCollection(consts.VARIABLE_COLLECTIONS.STATE_LOCAL);
  const localState: ParseLocalState = {};
  if (!state) return;
  for (const id of state.variableIds) {
    const variable = await figma.variables.getVariableByIdAsync(id);
    if (!variable) return;
    const [page, component, name] = variable.name.split('/');
    if (!localState[page]) localState[page] = {};
    if (!localState[page][component]) localState[page][component] = [];
    const initial = variable.valuesByMode[state.defaultModeId];
    localState[page][component].push([name, initial]);
  }
  return localState;
}
