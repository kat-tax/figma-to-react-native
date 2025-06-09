import CodeBlockWriter from 'code-block-writer';

import {writeImports} from './writeImports';
import {writeFunction} from './writeFunction';
import {writeStyleSheet} from './writeStyleSheet';

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

  // const t0 = Date.now();
  await writeFunction(body, flags, data, settings, infoDb);
  // const t1 = Date.now();
  // console.log('>> [gen/function]', t1 - t0, 'ms');

  // const t2 = Date.now();
  await writeStyleSheet(body, flags, data);
  // const t3 = Date.now();
  // console.log('>> [gen/stylesheet]', t3 - t2, 'ms');

  // const t4 = Date.now();
  await writeImports(head, flags, data, infoDb);
  // const t5 = Date.now();
  // console.log('>> [gen/imports]', t5 - t4, 'ms');

  return head.toString() + body.toString();
}
