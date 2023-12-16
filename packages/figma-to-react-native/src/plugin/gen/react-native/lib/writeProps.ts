import CodeBlockWriter from 'code-block-writer';
import {createIdentifierPascal} from 'common/string';
import {getPropName, sortPropsDef} from 'plugin/fig/lib';

import type {ImportFlags} from './writeImports';

export function writeProps(
  writer: CodeBlockWriter,
  flags: ImportFlags,
  propDefs: ComponentPropertyDefinitions,
  componentName: string,
  pressables: string[][],
  isIcon: boolean,
  isRootPressable: boolean,
) {
  const props = propDefs ? Object.entries(propDefs) : [];

  writer.write(`export interface ${componentName}Props`).block(() => {
    // Figma props
    let hasWroteDisableProp = false;
    props.sort(sortPropsDef).forEach(([key, prop]) => {
      const propName = getPropName(key);

      if (propName === 'disabled') {
        if (hasWroteDisableProp) return;
        hasWroteDisableProp = true;
      }

      const isBoolean = prop.type === 'BOOLEAN';
      const isVariant = prop.type === 'VARIANT';
      const isInstanceSwap = prop.type === 'INSTANCE_SWAP';
      const isRootPressableState = propName === 'state' && isRootPressable && isVariant;
      const isConditionalProp = isBoolean || isInstanceSwap || isRootPressableState;
      const propCond = isConditionalProp ? '?' : '';
      const propType: string = isVariant
        ? prop.variantOptions
          .map((v) => `'${createIdentifierPascal(v)}'`)
          .join(' | ')
        : isInstanceSwap
          ? `JSX.Element`
          : prop.type === 'TEXT'
            ? 'string'
            : prop.type.toLowerCase();

      writer.writeLine(`${propName}${propCond}: ${propType},`);

      // Write disabled prop if needed (special use case)
      if (isRootPressableState && !hasWroteDisableProp) {
        writer.writeLine(`disabled?: boolean,`);
        hasWroteDisableProp = true;
      }
    });

    // Custom props
    if (pressables?.length > 0) {
      flags.reactNativeTypes.GestureResponderEvent = true;
      pressables.forEach(([,,id]) => {
        writer.writeLine(`${id}?: (e: GestureResponderEvent) => void,`);
      });
    }

    // Icon props
    if (isIcon) {
      writer.writeLine(`color?: string,`);
    }

    // Test ID
    writer.writeLine(`testID?: string,`);
  });
  writer.blankLine();
}
