import CodeBlockWriter from 'code-block-writer';
import {getPropName} from 'backend/fig/lib';

import type {ParseStyles, ParseVariantData} from 'types/parse';
import type {ImportFlags} from './writeImports';

export function writeStyles(
  writer: CodeBlockWriter,
  flags: ImportFlags,
  name: string,
  variants?: ParseVariantData,
) {
  const hasVariants = !!variants;
  const hasStyles = hasVariants && Object.keys(variants.classes).length > 0;
  const hasColors = hasVariants && Object.keys(variants.fills).length > 0;

  // Import flags
  flags.exoVariants.useVariants = hasStyles || hasColors;
  flags.unistyles.useStyles = true;

  // No variants
  if (!hasVariants || (!hasStyles && !hasColors)) {
    writer.writeLine(`const {styles} = useStyles(stylesheet);`);
    writer.blankLine();
    return;
  }

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
            varIds.add(getPropName(state));
            return value;
          });
          return [k, v];
        });
    });
  }

  // Derive colors data from variants
  Object.keys(variants.fills).forEach((k: string) => {
    colors[k] = Object
      .keys(variants.fills[k])
      .filter(v => !!variants.fills[k][v])
      .map(v => {
        const k = v.split(', ')?.map(part => {
          const [state, value] = part.split('=');
          varIds.add(getPropName(state));
          return value;
        });
        return [k, v];
      });
  });

  // Write hooks
  const props = Array.from(varIds).join(', ');
  writer.writeLine(`const {${props}} = props;`);
  writer.writeLine(`const {styles, theme} = useStyles(stylesheet);`);
  writer.writeLine(`const {vstyles} = useVariants(${name}Variants, {${props}}, styles);`);
  writer.blankLine();
}
