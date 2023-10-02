import CodeBlockWriter from 'code-block-writer';
import {createIdentifierPascal, createIdentifierCamel} from 'common/string';
import {getPropName} from 'plugin/fig/lib/getPropName';

import type {ParseData} from 'types/parse';

export function writeClasses(
  writer: CodeBlockWriter,
  data: ParseData,
  metadata: {
    stylePrefix: string,
    isPreview?: boolean, 
  },
  isRootPressable?: boolean,
) {
  const conditions = new Set<Record<string, string>>();
  const classes = new Set<Record<string, unknown>>();
  const props = new Set<string>();
  
  // Build classes from variants
  Object.keys(data.variants).forEach((k: string) => {
    classes[k] = Object
      .keys(data.variants[k])
      .filter(v => !!data.variants[k][v])
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
  const pressableFunc = '(e: {focused: boolean, hovered: boolean, pressed: boolean}) => ';
  const pressableStates = {
    '_stateFocused': 'e.focused',
    '_stateHovered': 'e.hovered',
    '_statePressed': 'e.pressed',
  };
  const pressableSpecialStates = {
    '_stateDefault': '!props.state || ',
    '_stateDisabled': 'props.disabled || ',
  };

  // Write conditions to variables
  Object.keys(conditions)
    .sort((a, b) => a.localeCompare(b))
    .forEach(cond => {
      const specialState = pressableSpecialStates[cond] || '';
      const expression = conditions[cond];
      writer.write(`const ${cond} = ${specialState}${expression};`).newLine();
    });
  writer.blankLine();
  
  // Classes object
  writer.write(`const dynamic = React.useMemo(() => (`).inlineBlock(() => {
    Object.keys(classes).forEach(slug => {
      const dynamic = slug === 'root' && isRootPressable ? pressableFunc : '';
      writer.write(`${slug}: ${dynamic}[`).indent(() => {
        writer.writeLine(`${metadata.stylePrefix}.${slug},`);
        Array.from(classes[slug])
          .forEach((data: string[][]) => {
            const [rules, raw] = data;
            const condition = rules.map(ruleName => {
              const pressableState = dynamic && pressableStates[ruleName] as string;
              return pressableState
                ? `(${ruleName} || ${pressableState})`
                : ruleName;
              }).join(' && ');
            const className = `${slug}_${raw}`.split(', ').join('_').replace(/\=/g, '_');
            writer.writeLine(`${condition} && ${metadata.stylePrefix}.${createIdentifierCamel(className)},`);
          });
      });
      writer.writeLine('],');
    });      
  });

  // Cache props array
  const cacheProps = Array.from(props).map(p => `props.${p}`);
  writer.write(`), [${cacheProps.join(', ')}]);`);
  writer.blankLine();
}
