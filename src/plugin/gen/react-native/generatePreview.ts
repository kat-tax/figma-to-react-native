import CodeBlockWriter from 'code-block-writer';
import parseFigma from 'plugin/fig/parse';

import {generateTheme} from './generateTheme';
import {writeStyleSheet} from './lib/writeStyleSheet';
import {writeFunction} from './lib/writeFunction';
import {writeImports} from './lib/writeImports';

import type {ParseData} from 'types/parse';
import type {Settings} from 'types/settings';

export async function generatePreview(data: ParseData, settings: Settings) {
  const writer = new CodeBlockWriter(settings?.writer);
  const primitives = new Set(['View', 'Text', 'Image', 'Pressable', 'TouchableHighlight']);
  const metadata = {stylePrefix: 'styles', isPreview: true};
  data.meta.primitives = primitives;
  writeImports(writer, data, settings, metadata);
  writer.blankLine();
  writer.write(generateTheme(settings));
  writer.blankLine();
  writeFunction(writer, data, settings, metadata, true);
  writer.blankLine();
  writeStyleSheet(writer, data, settings, metadata, true);
  writer.blankLine();
  await writeDependencies(writer, settings, {...data.meta.components, ...data.meta.includes});
  writer.blankLine();
  return writer.toString();
}

async function writeDependencies(
  writer: CodeBlockWriter,
  settings: Settings,
  nodes?: Record<string, [BaseNode, BaseNode]>, 
  index?: Set<BaseNode>,
) {
  index = index || new Set<BaseNode>();
  for await (const [id, [node, _instance]] of Object.entries(nodes)) {
    const stylePrefix = '_' + id.split(':').join('_');
    const metadata = {stylePrefix, isPreview: true};
    const content = (node as ComponentSetNode).defaultVariant ?? node;
    if (index.has(content)) continue;
    index.add(content);
    const data = await parseFigma(content as ComponentNode, settings, true);
    writeFunction(writer, data, settings, metadata);
    writer.blankLine();
    writeStyleSheet(writer, data, settings, metadata);
    writer.blankLine();
    writeDependencies(writer, settings, data.meta.components, index);
  }
}
