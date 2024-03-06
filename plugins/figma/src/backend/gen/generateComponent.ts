import CodeBlockWriter from 'code-block-writer';

import {writeImports} from './lib/writeImports';
import {writeFunction} from './lib/writeFunction';
import {writeStyleSheet} from './lib/writeStyleSheet';

import type {ImportFlags} from './lib/writeImports';
import type {ProjectSettings} from 'types/settings';
import type {ParseData} from 'types/parse';

export function generateComponent(data: ParseData, settings: ProjectSettings) {
  const head = new CodeBlockWriter(settings?.writer);
  const body = new CodeBlockWriter(settings?.writer);
  const flags: ImportFlags = {
    react: {},
    reactNative: {},
    reactNativeTypes: {},
    unistyles: {},
    lingui: {},
    exoVariants: {},
    exoIcon: {},
    exoImage: {},
    exoVideo: {},
    exoLottie: {},
    exoRive: {},
  };

  writeFunction(body, flags, data, settings);
  writeStyleSheet(body, flags, data);
  writeImports(head, flags, data);

  return head.toString() + body.toString();
}
