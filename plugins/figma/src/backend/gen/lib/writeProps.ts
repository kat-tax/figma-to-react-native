import CodeBlockWriter from 'code-block-writer';
import {createIdentifierPascal} from 'common/string';
import {getPropName, sortPropsDef} from 'backend/fig/lib';

import type {ImportFlags} from './writeImports';

export function writeProps(
  writer: CodeBlockWriter,
  flags: ImportFlags,
  propDefs: ComponentPropertyDefinitions,
  componentName: string,
  pressables: string[][],
  isRootPressable: boolean,
  isIcon: boolean,
) {
  // Import pressable props
  flags.reactNativeTypes.PressableProps = isRootPressable;

  // Build props from Figma component property definitions
  const props = propDefs ? Object.entries(propDefs) : [];
  const propLines: string[] = [];
  const variantMap: Record<string, string[]> = {};
  props.sort(sortPropsDef).forEach(([key, prop]) => {
    // Prop type
    const isBoolean = prop.type === 'BOOLEAN';
    const isVariant = prop.type === 'VARIANT';
    const isInstanceSwap = prop.type === 'INSTANCE_SWAP';
    const isConditional = isBoolean || isVariant || isInstanceSwap;
    // Prop metadata
    const propName = getPropName(key);
    const propType: string = isVariant
      ? `typeof ${componentName}Variants.${propName}[number]`
      : isInstanceSwap
        ? `JSX.Element`
        : prop.type === 'TEXT'
          ? 'string'
          : prop.type.toLowerCase();
    // Record prop
    propLines.push(`${propName}${isConditional ? '?' : ''}: ${propType},`);
    // Record variant
    if (isVariant) {
      variantMap[propName] = prop.variantOptions.map(v => createIdentifierPascal(v));
    }
  });

  // Write component props
  const extProps = isRootPressable ? ' extends PressableProps ' : '';
  writer.write(`export interface ${componentName}Props${extProps}`).block(() => {
    // Figma props
    propLines.forEach(line => writer.writeLine(line));
    // Custom props
    if (pressables?.length > 0) {
      pressables.forEach(([,,id]) => {
        if (!isRootPressable || id !== 'onPress') {
          flags.reactNativeTypes.GestureResponderEvent = true;
          writer.writeLine(`${id}?: (e: GestureResponderEvent) => void,`);
        }
      });
    }
    // Icon props
    if (isIcon) {
      writer.writeLine(`color?: string,`);
    }
    // Test ID
    if (!isRootPressable) {
      writer.writeLine(`testID?: string,`);
    }
  });
  writer.blankLine();

  // Write variants
  if (Object.keys(variantMap).length > 0) {
    writer.writeLine(`export const ${componentName}Variants = {`).indent(() => {
      Object.entries(variantMap).forEach(([key, values]) => {
        writer.write(`${key}: [`);
        values.forEach((value, i) => {
          writer.quote(value);
          i < values.length - 1 && writer.write(', ');
        });
        writer.write('],');
        writer.newLine();
      });
    }).writeLine(`} as const;`);
    writer.blankLine();
  }
}
