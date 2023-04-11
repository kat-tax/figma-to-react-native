import CodeBlockWriter from 'code-block-writer';
import {generateTheme} from 'modules/generate/theme';
import {writeImports, writeFunction, writeStyleSheet} from 'modules/generate/utils';
import {parseStyles} from 'modules/parse/styles';
import {parseNodes} from 'modules/parse/nodes';
import {getName} from 'utils/figma';

import type {ParsedComponent, ParseData} from 'types/parse';
import type {Settings} from 'types/settings';

export function generatePreview(root: ParsedComponent, children: ParseData, settings: Settings) {
  const writer = new CodeBlockWriter(settings.output?.format);
  const {components, stylesheet} = children.state;
  const primitives = new Set(['Text', 'Image']);
  const libraries = new Set(['react-native-svg']);
  
  writeImports(writer, settings, primitives, libraries);
  writer.blankLine();
  writer.write(generateTheme(settings));
  writer.blankLine();
  writeFunction(writer, settings, root, children.code);
  writer.blankLine();
  writeStyleSheet(writer, root, stylesheet);
  writer.blankLine();
  writeComponents(writer, settings, components);
  writer.blankLine();

  return writer.toString();
}

function writeComponents(writer: CodeBlockWriter, settings: Settings, components?: string[]) {
  Object.values(components).forEach((sub: any) => {
    const root: ParsedComponent = {
      id: sub.id,
      tag: 'View',
      slug: 'root',
      node: sub,
      name: getName(sub.name),
      styles: parseStyles(sub, true),
    };

    const styleid = '_' + sub.id.split(':').join('_');
    const parsed = parseNodes([...sub.children]);

    writeFunction(writer, settings, root, parsed.code, styleid);
    writer.blankLine();
    writeStyleSheet(writer, root, parsed.state.stylesheet, styleid);
    writer.blankLine();
    writeComponents(writer, settings, parsed.state.components);
  });
}
