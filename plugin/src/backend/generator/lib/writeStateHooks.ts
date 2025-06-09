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
  const name = data.root.node.name;
  const page = getPage(data.root.node);

  data.localState?.[page.name]?.[name]?.forEach(([name, value]) => {
    flags.react.useState = true;
    const getName = createIdentifierCamel(name);
    const setName = createIdentifierCamel(`set_${name}`);
    writer.write(`const [${getName}, ${setName}] = useState(`);
    if (typeof value === 'string') {
      writer.quote(value);
    } else {
      writer.write(value.toString());
    }
    writer.write(');');
    writer.newLine();
  });
}
