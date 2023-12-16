import {on, emit} from '@create-figma-plugin/utilities';
import {useEffect} from 'preact/hooks';
import {cssToRN, buildCSS, init} from 'css-to-rn';

init('https://esm.sh/lightningcss-wasm@1.22.0/lightningcss_node.wasm');

import type {EventStyleGenReq, EventStyleGenRes} from 'types/events';

export function useStyleGenServer() {
  useEffect(() => on<EventStyleGenReq>('STYLE_GEN_REQ', async (css) => {
    const stylesheet = cssToRN(buildCSS(css));
    emit<EventStyleGenRes>('STYLE_GEN_RES', stylesheet);
  }), []);
}
