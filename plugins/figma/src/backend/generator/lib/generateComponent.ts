import CodeBlockWriter from 'code-block-writer';

import {writeImports} from './writeImports';
import {writeFunction} from './writeFunction';
import {writeStyleSheet} from './writeStyleSheet';

import type {ImportFlags} from './writeImports';
import type {ProjectSettings} from 'types/settings';
import type {ParseData} from 'types/parse';

export async function generateComponent(data: ParseData, settings: ProjectSettings) {
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

  await writeFunction(body, flags, data, settings);
  await writeStyleSheet(body, flags, data);
  await writeImports(head, flags, data);

  return head.toString() + body.toString();
}
