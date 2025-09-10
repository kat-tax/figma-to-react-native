import CodeBlockWriter from 'code-block-writer';
import {getComponentPropName} from 'backend/parser/lib';

import type {ImportFlags} from './writeImports';
import type {ParseStyles, ParseVariantData} from 'types/parse';

export function writeHookStyles(
  writer: CodeBlockWriter,
  flags: ImportFlags,
  name: string,
  variants?: ParseVariantData,
) {
  const hasVariants = !!variants;
  const hasStyles = hasVariants && Object.keys(variants.classes).length > 0;
  const hasIcons = hasVariants && Object.keys(variants.icons).length > 0;

  // No variants for styles/icons, no hooks needed
  if (!hasVariants || (!hasStyles && !hasIcons)) {
    return;
  }

  // Flag useVariants from react-exo/utils for import
  flags.exoUtils.useVariants = hasStyles || hasIcons;

  const varIds = new Set<string>();
  const styles = new Set<Record<string, ParseStyles>>();
  const colors = new Set<Record<string, Record<string, string>>>();

  // Derive styles data from variants
  if (hasStyles) {
    Object.keys(variants.classes).forEach((k: string) => {
      styles[k] = Object
        .keys(variants.classes[k])
        .filter(v => !!variants.classes[k][v])
        .map(v => {
          const k = v.split(', ')?.map(part => {
            const [state, value] = part.split('=');
            varIds.add(getComponentPropName(state));
            return value;
          });
          return [k, v];
        });
    });
  }

  // Derive icon data from variants
  if (hasIcons) {
    Object.keys(variants.icons).forEach((k: string) => {
      colors[k] = Object
        .keys(variants.icons[k])
        .filter(v => !!variants.icons[k][v])
        .map(v => {
          const k = v.split(', ')?.map(part => {
            const [state, value] = part.split('=');
            varIds.add(getComponentPropName(state));
            return value;
          });
          return [k, v];
        });
      });
  }

  // Write hooks
  const props = Array.from(varIds).join(', ');
  writer.writeLine(`const {${props}} = props;`);
  writer.writeLine(`const {vstyles} = useVariants(${name}Variants, {${props}}, styles);`);
  writer.blankLine();
}
