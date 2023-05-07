import CodeBlockWriter from 'code-block-writer';
import {writeImports, writeFunction, writeStyleSheet} from 'modules/gen/react-native/utils';
import {getName} from 'modules/fig/utils';

import type {ParseData, ParsedComponent} from 'types/parse';
import type {Settings} from 'types/settings';

export function generateComponent(root: ParsedComponent, parsed: ParseData, settings: Settings) {
  const writer = new CodeBlockWriter(settings?.writer);
  const {components, stylesheet, primitives, libraries} = parsed.state;
  const imports = Object.entries(components)
    .map((c: any) => c ? getName(c[1].name) : '')
    .filter(Boolean);

  writeImports(writer, settings, primitives, libraries, imports);
  writer.blankLine();
  writeFunction(writer, settings, root, parsed.code);
  writer.blankLine();
  writeStyleSheet(writer, root, stylesheet);
  writer.newLine();

  return writer.toString();
}
