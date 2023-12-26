import {useEffect} from 'preact/hooks';
import {on, emit} from '@create-figma-plugin/utilities';
import {init, cssToReactNative, buildCSS} from 'css-to-rn';

init('https://esm.sh/lightningcss-wasm@1.22.0/lightningcss_node.wasm');

import type {EventStyleGenReq, EventStyleGenRes} from 'types/events';

export function useStyleGenServer() {
  useEffect(() => on<EventStyleGenReq>('STYLE_GEN_REQ', async (css) => {
    const stylesheet = cssToReactNative(buildCSS(css));
    emit<EventStyleGenRes>('STYLE_GEN_RES', stylesheet);
  }), []);
}
