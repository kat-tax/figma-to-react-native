import CodeBlockWriter from 'code-block-writer';
import {createIdentifierCamel} from 'common/string';
import {getVariableCollection, getPage} from 'backend/parser/lib';
import {VARIABLE_COLLECTIONS} from './consts';

import type {ImportFlags} from './writeImports';
import type {ParseData} from 'types/parse';

export async function writeStateHooks(
  writer: CodeBlockWriter,
  flags: ImportFlags,
  data: ParseData,
) {
  // Check if root has a variable group (matches page and name)
  const state = await getVariableCollection(VARIABLE_COLLECTIONS.STATE_LOCAL);
  if (!state) return;
  const rootName = data.root.node.name;
  const rootPage = getPage(data.root.node);
  // Loop through all variables in the collection
  // write the ones matching the page and name of the root node
  for await (const id of state.variableIds) {
    const variable = await figma.variables.getVariableByIdAsync(id);
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
  }
}
