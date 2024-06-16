import CodeBlockWriter from 'code-block-writer';

import * as parser from 'backend/parser/lib';
import * as string from 'common/string';

import type {ImportFlags} from './writeImports';
import type {ParseData} from 'types/parse';

export function writeStateHooks(
  writer: CodeBlockWriter,
  flags: ImportFlags,
  data: ParseData,
) {
  const name = data.root.node.name;
  const page = parser.getPage(data.root.node);

  data.localState?.[page.name]?.[name]?.forEach(([name, value]) => {
    flags.react.useState = true;
    const getName = string.createIdentifierCamel(name);
    const setName = string.createIdentifierCamel(`set_${name}`);
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
