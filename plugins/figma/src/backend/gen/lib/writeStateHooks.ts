import CodeBlockWriter from 'code-block-writer';
import {createIdentifierCamel} from 'common/string';
import {getCollectionByName, getPage} from 'backend/fig/lib';
import {VARIABLE_COLLECTIONS} from 'backend/gen/lib/consts';

import type {ParseData} from 'types/parse';
import type {ImportFlags} from './writeImports';

export function writeStateHooks(
  writer: CodeBlockWriter,
  flags: ImportFlags,
  data: ParseData,
) {
  // Check if root has a variable group (matches page and name)
  const state = getCollectionByName(VARIABLE_COLLECTIONS.STATE_LOCAL);
  if (!state) return;
  const rootName = data.root.node.name;
  const rootPage = getPage(data.root.node);
  // Loop through all variables in the collection
  // write the ones matching the page and name of the root node
  state.variableIds.forEach(id => {
    const variable = figma.variables.getVariableById(id);
    if (!variable) return;
    const [page, component, name] = variable.name.split('/');
    if (page !== rootPage.name || component !== rootName) return;
    // TODO: handle other variable types (number / boolean only atm)
    // TODO: add typing based on variable type
    const initValue = variable.valuesByMode[state.defaultModeId];
    const getName = createIdentifierCamel(name);
    const setName = createIdentifierCamel(`set_${name}`);
    writer.writeLine(`const [${getName}, ${setName}] = useState(${initValue});`);
    flags.react.useState = true;
  });
}
