import CodeBlockWriter from 'code-block-writer';
import {createIdentifierCamel} from 'common/string';
import {getPage} from 'backend/parser/lib';

import type {ImportFlags} from './writeImports';
import type {ParseData} from 'types/parse';

export function writeStateHooks(
  writer: CodeBlockWriter,
  flags: ImportFlags,
  data: ParseData,
) {
  const rootName = data.root.node.name;
  const rootPage = getPage(data.root.node);
  const localState = data.localState?.[rootPage.name]?.[rootName];
  localState?.forEach(([name, value]) => {
    const getName = createIdentifierCamel(name);
    const setName = createIdentifierCamel(`set_${name}`);
    writer.writeLine(`const [${getName}, ${setName}] = useState(${value});`);
    flags.react.useState = true;
  });
}
