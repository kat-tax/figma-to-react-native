import CodeBlockWriter from 'code-block-writer';

import {writeStyleSheet} from './lib/writeStyleSheet';
import {writeFunction} from './lib/writeFunction';
import {writeImports} from './lib/writeImports';

import type {ParseData} from 'types/figma';
import type {Settings} from 'types/settings';

export function generateCode(data: ParseData, settings: Settings) {
  const writer = new CodeBlockWriter(settings?.writer);
  const metadata = {stylePrefix: 'styles'};
  
  writeImports(writer, data, settings, metadata);
  writer.blankLine();
  writeFunction(writer, data, settings, metadata);
  writer.blankLine();
  writeStyleSheet(writer, data, settings, metadata);
  writer.newLine();
  return writer.toString();
}
