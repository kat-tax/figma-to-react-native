import CodeBlockWriter from 'code-block-writer';
import {writeImports, writeFunction, writeStyleSheet} from './utils';

import type {ParseData} from 'types/figma';
import type {Settings} from 'types/settings';

export function generateComponent(data: ParseData, settings: Settings) {
  const writer = new CodeBlockWriter(settings?.writer);
  writeImports(writer, data, settings);
  writer.blankLine();
  writeFunction(writer, data, settings, 'styles');
  writer.blankLine();
  writeStyleSheet(writer, data, settings, 'styles');
  writer.newLine();
  return writer.toString();
}
