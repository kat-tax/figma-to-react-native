import {useEffect} from 'react';
import {on, emit} from '@create-figma-plugin/utilities';
import {cssToReactNative, buildCSS} from 'css-to-rn-local';

import type {EventStyleGenReq, EventStyleGenRes} from 'types/events';

export function useStyleGenServer() {
  useEffect(() => on<EventStyleGenReq>('STYLE_GEN_REQ', async (css) => {
    const stylesheet = await cssToReactNative(buildCSS(css));
    emit<EventStyleGenRes>('STYLE_GEN_RES', stylesheet);
    console.log('[stylegen]', css, stylesheet)
  }), []);
}
