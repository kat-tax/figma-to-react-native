import type {FontFamily} from 'lightningcss-wasm';

export default (fontFamily: FontFamily[]) => {
  // React Native only allows one font family - better hope this is the right one :)
  return fontFamily[0];
}
