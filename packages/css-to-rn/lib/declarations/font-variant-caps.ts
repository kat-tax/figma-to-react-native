import type {FontVariantCaps} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types';

export default (fontVariantCaps: FontVariantCaps, options: ParseDeclarationOptionsWithValueWarning) => {
  const allowed = new Set([
    'small-caps',
    'oldstyle-nums',
    'lining-nums',
    'tabular-nums',
    'proportional-nums',
  ]);

  if (allowed.has(fontVariantCaps)) {
    return fontVariantCaps;
  }

  options.addValueWarning(fontVariantCaps);
  return undefined;
}
