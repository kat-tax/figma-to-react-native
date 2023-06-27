import CodeBlockWriter from 'code-block-writer';
//import {parseVariantStyles} from 'modules/fig/variant';
import parseFigma from 'modules/fig/parse';

import {generateTheme} from './theme';
import {writeImports, writeFunction, writeStyleSheet} from './utils';

import type {TargetNode, ParseData} from 'types/figma';
import type {Settings} from 'types/settings';

export async function generatePreview(data: ParseData, settings: Settings) {
  const writer = new CodeBlockWriter(settings?.writer);
  const primitives = new Set(['Text', 'Image']);
  data.meta.primitives = primitives;
  // const variantStyles = parseVariantStyles(root.node, root.styles, stylesheet);
  writeImports(writer, data, settings);
  writer.blankLine();
  writer.write(generateTheme(settings));
  writer.blankLine();
  writeFunction(writer, data, settings);
  writer.blankLine();
  writeStyleSheet(writer, data, settings);
  writer.blankLine();
  await writeComponents(writer, settings, {...data.meta.components, ...data.meta.includes});
  writer.blankLine();
  return writer.toString();
}

async function writeComponents(
  writer: CodeBlockWriter,
  settings: Settings,
  nodes?: Record<string, BaseNode>, 
  index?: Set<BaseNode>,
) {
  index = index || new Set<BaseNode>();
  for await (const [id, node] of Object.entries(nodes)) {
    const stylesPrefix = '_' + id.split(':').join('_');
    const content = (node as ComponentSetNode).defaultVariant ?? node;
    if (index.has(content)) continue;
    index.add(content);
    const data = await parseFigma(content as TargetNode, settings);
    // const variantStyles = parseVariantStyles(root.node, root.styles, parsed.state.stylesheet);
    writeFunction(writer, data, settings, stylesPrefix);
    writer.blankLine();
    writeStyleSheet(writer, data, settings, stylesPrefix);
    writer.blankLine();
    writeComponents(writer, settings, data.meta.components, index);
  }
}
