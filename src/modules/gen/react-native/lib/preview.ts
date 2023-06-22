import CodeBlockWriter from 'code-block-writer';
import {parseVariantStyles} from 'modules/fig/variant';
import {parseStyles} from 'modules/fig/styles';
import {parseNodes} from 'modules/fig/nodes';
import {getName} from 'modules/fig/utils';

import {generateTheme} from './theme';
import {writeImports, writeFunction, writeStyleSheet} from './utils';

import type {ParsedComponent, ParseData} from 'types/parse';
import type {Settings} from 'types/settings';

export function generatePreview(root: ParsedComponent, children: ParseData, settings: Settings) {
  const {stylesheet, components, includes} = children.state;
  const writer = new CodeBlockWriter(settings?.writer);
  const libraries = new Set(['react-native-svg']);
  const primitives = new Set(['Text', 'Image']);
  const variantStyles = parseVariantStyles(root.node, root.styles, stylesheet);
  const stylePrefix = 'styles';
  
  writeImports(writer, settings, primitives, libraries);
  writer.blankLine();
  writer.write(generateTheme(settings));
  writer.blankLine();
  writeFunction(writer, settings, root, children.code, stylePrefix, variantStyles);
  writer.blankLine();
  writeStyleSheet(writer, root, stylesheet, stylePrefix, variantStyles);
  writer.blankLine();
  writeComponents(writer, settings, components);
  writer.blankLine();
  writeComponents(writer, settings, includes);
  writer.blankLine();

  return writer.toString();
}

function writeComponents(writer: CodeBlockWriter, settings: Settings, components?: string[]) {
  Object.values(components).forEach((sub: any) => {
    const content = sub.defaultVariant ?? sub;
    const root: ParsedComponent = {
      id: sub.id,
      tag: 'View',
      slug: 'root',
      node: content,
      name: getName(sub.name),
      styles: parseStyles(content, true),
    };

    const parsed = parseNodes([...content.children]);
    const stylePrefix = '_' + sub.id.split(':').join('_');
    const variantStyles = parseVariantStyles(root.node, root.styles, parsed.state.stylesheet);

    writeFunction(writer, settings, root, parsed.code, stylePrefix);
    writer.blankLine();
    writeStyleSheet(writer, root, parsed.state.stylesheet, stylePrefix, variantStyles);
    writer.blankLine();
    writeComponents(writer, settings, parsed.state.components);
  });
}
