import CodeBlockWriter from 'code-block-writer';
import {titleCase} from 'common/string';
import {getCollectionByName, getPage} from 'plugin/fig/lib';

import type {ParseData} from 'types/parse';

export function writeState(
  writer: CodeBlockWriter,
  data: ParseData,
) {
  // Check if root has a variable group (matches page and name)
  const state = getCollectionByName('State');
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
    writer.writeLine(`const [${name}, set${titleCase(name)}] = React.useState(${initValue});`);
  });
}
