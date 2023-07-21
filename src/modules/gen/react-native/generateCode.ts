import CodeBlockWriter from 'code-block-writer';

import {writeStyleSheet} from './lib/writeStyleSheet';
import {writeFunction} from './lib/writeFunction';
import {writeImports} from './lib/writeImports';

import type {ParseData} from 'types/figma';
import type {Settings} from 'types/settings';

export function generateCode(data: ParseData, settings: Settings) {
  const writer = new CodeBlockWriter(settings?.writer);
  writeImports(writer, data, settings);
  writer.blankLine();
  writeFunction(writer, data, settings, 'styles');
  writer.blankLine();
  writeStyleSheet(writer, data, settings, 'styles');
  writer.newLine();
  return writer.toString();
}
