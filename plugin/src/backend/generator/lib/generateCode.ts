import CodeBlockWriter from 'code-block-writer';

import {writeStyleSheet} from './writeStyleSheet';
import {writeFunction} from './writeFunction';
import {writeImports} from './writeImports';

import type {ImportFlags} from './writeImports';
import type {ProjectSettings} from 'types/settings';
import type {ComponentInfo} from 'types/component';
import type {ParseData} from 'types/parse';

export async function generateCode(
  data: ParseData,
  settings: ProjectSettings,
  infoDb: Record<string, ComponentInfo> | null,
) {
  const head = new CodeBlockWriter(settings?.writer);
  const body = new CodeBlockWriter(settings?.writer);
  const flags: ImportFlags = {
    react: {},
    reactNative: {},
    reactNativeTypes: {},
    unistyles: {},
    lingui: {},
    exoUtils: {},
    exoIcon: {},
    exoImage: {},
    exoVideo: {},
    exoMotion: {},
    exoLottie: {},
    exoRive: {},
    exoGrid: {},
    useStylesTheme: false,
  };

  await writeFunction(body, flags, data, settings, infoDb);
  await writeStyleSheet(body, flags, data);
  await writeImports(head, flags, data, infoDb);

  return head.toString() + body.toString();
}
