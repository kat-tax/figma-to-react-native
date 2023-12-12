import CodeBlockWriter from 'code-block-writer';

import {writeImports} from './lib/writeImports';
import {writeFunction} from './lib/writeFunction';
import {writeStyleSheet} from './lib/writeStyleSheet';

import type {Settings} from 'types/settings';
import type {ParseData} from 'types/parse';
import type {ImportFlags} from './lib/writeImports';

export function generateCode(data: ParseData, settings: Settings) {
  const head = new CodeBlockWriter(settings?.writer);
  const body = new CodeBlockWriter(settings?.writer);
  const flags: ImportFlags = {
    exo: {},
    lingui: {},
    unistyles: {},
    react: {},
    reactNative: {},
    reactNativeTypes: {},
  };

  writeFunction(body, flags, data, settings);
  writeStyleSheet(body, flags, data);
  writeImports(head, flags, data);

  return head.toString() + body.toString();
}
