import CodeBlockWriter from 'code-block-writer';

import {writeImports} from './lib/writeImports';
import {writeFunction} from './lib/writeFunction';
import {writeStyleSheet} from './lib/writeStyleSheet';

import type {ParseData} from 'types/parse';
import type {Settings} from 'types/settings';

export function generateCode(data: ParseData, settings: Settings) {
  const writer = new CodeBlockWriter(settings?.writer);
  const metadata = {stylePrefix: 'stylesheet'};
  
  writeImports(writer, data, settings);
  writer.blankLine();
  writeFunction(writer, data, settings, metadata);
  writer.blankLine();
  writeStyleSheet(writer, data, settings, metadata);
  writer.newLine();

  return writer.toString();
}
