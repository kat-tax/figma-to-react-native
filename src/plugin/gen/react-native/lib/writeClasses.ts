import CodeBlockWriter from 'code-block-writer';
import {createIdentifierPascal, createIdentifierCamel} from 'common/string';
import {getPropName} from 'plugin/fig/lib/getPropName';

import type {ParseData, ParseStyles} from 'types/parse';

export function writeClasses(writer: CodeBlockWriter, data: ParseData, isRootPressable?: boolean) {
  const conditions = new Set<Record<string, string>>();
  const classes = new Set<Record<string, ParseStyles>>();
  const props = new Set<string>();
  
  // Build classes from variants
  Object.keys(data.variants.classes).forEach((k: string) => {
    classes[k] = Object
      .keys(data.variants.classes[k])
      .filter(v => !!data.variants.classes[k][v])
      .map(v => {
        const decoded = v.split(', ')?.map(part => {
          const [state, value] = part.split('=');
          const enumVal = createIdentifierPascal(value);
          const propId = getPropName(state);
          const condVal = `props.${propId} === '${enumVal}'`;
          const condName = `${state}_${value}`.split(', ').join('_').replace(/\=/g, '_');
          const condId = '_' + createIdentifierCamel(condName);
          conditions[condId] = condVal;
          props.add(propId);
          return condId;
        });
        return [decoded, v];
      });
  });

  // Used for pressable dynamic styles
  const pressableFunction =
    '(e: {focused: boolean, hovered: boolean, pressed: boolean}) => ';

  const pressableDisableState = {
    '_stateDisabled': ' || props.disabled',
  };
  const pressableStates = {
    '_stateFocused': 'e.focused',
    '_stateHovered': 'e.hovered',
    '_statePressed': 'e.pressed',
  };

  // Write conditions to variables
  Object.keys(conditions)
    .sort((a, b) => a.localeCompare(b))
    .forEach(cond => {
      // Skip default state
      if (cond === '_stateDefault') return;
      const specialState = pressableDisableState[cond] || '';
      const expression = conditions[cond];
      writer.write(`const ${cond} = ${expression}${specialState};`).newLine();
    });
  writer.blankLine();
  
  // Classes object
  writer.write(`const $styles = React.useMemo(() => (`).inlineBlock(() => {
    for (const slug of Object.keys(classes)) {
      const dynamic = slug === 'root' && isRootPressable ? pressableFunction : '';
      writer.write(`${slug}: ${dynamic}[`).indent(() => {
        writer.writeLine(`styles.${slug},`);
        Array.from(classes[slug]).forEach((data: string[][]) => {
          const [rules, raw] = data;
          const condition = rules.map(ruleName => {
            const pressableState =  pressableStates[ruleName] as string;
            // Skip default state
            if (ruleName === '_stateDefault')
              return false;
            return pressableState && dynamic
              ? `(${ruleName} || ${pressableState})`
              : ruleName;
            }).filter(Boolean).join(' && ');
          const className = `${slug}_${raw}`.split(', ').join('_').replace(/\=/g, '_');
          writer.writeLine(`${condition} && styles.${createIdentifierCamel(className)},`);
        });
      });
      writer.writeLine('],');
    }
  });

  // Cache props array
  const cacheProps = Array.from(props).map(p => `props.${p}`);
  writer.write(`), [styles, ${cacheProps.join(', ')}]);`);
  writer.blankLine();
}
