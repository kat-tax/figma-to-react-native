import CodeBlockWriter from 'code-block-writer';
import {createIdentifierPascal, createIdentifierCamel} from 'common/string';
import {getPropName} from 'backend/parser/lib';

import type {ImportFlags} from '../writeImports';
import type {ParseData} from 'types/parse';

export function writeColors(
  writer: CodeBlockWriter,
  flags: ImportFlags,
  data: ParseData,
  isRootPressable?: boolean,
) {
  const props = new Set<string>();
  const fills = new Set<Record<string, Record<string, string>>>();
  const conds = new Set<Record<string, string>>();

  // Used for pressable dynamic styles
  const pressableFunction = '(e: PressableStateCallbackType) => ';
  const pressableStates = {
    '_stateFocused': 'e.focused',
    '_stateHovered': 'e.hovered',
    '_statePressed': 'e.pressed',
  };

  // Build fills from variants
  Object.keys(data.variants.fills).forEach((k: string) => {
    fills[k] = Object
      .keys(data.variants.fills[k])
      .filter(v => !!data.variants.fills[k][v])
      .map(v => {
        const decoded = v.split(', ')?.map(part => {
          const [state, value] = part.split('=');
          const propId = getPropName(state);
          const enumVal = createIdentifierPascal(value);
          const condVal = `props.${propId} === '${enumVal}'`;
          const condName = `${state}_${value}`.split(', ').join('_').replace(/\=/g, '_');
          const condId = '_' + createIdentifierCamel(condName);
          conds[condId] = condVal;
          props.add(propId);
          return condId;
        });
        return [decoded, v];
      });
  });

  // Classes object
  flags.react.useMemo = true;
  writer.write(`const colors = useMemo(() => (`).inlineBlock(() => {
    for (const slug of Object.keys(fills)) {
      const dynamic = isRootPressable ? pressableFunction : '';
      const variants = data.variants.fills[slug];
      // console.log('[colors]', slug, data);
      writer.write(`${slug}: ${dynamic}[`).indent(() => {
        // TODO: fix default color
        const defaultColor = 'theme.colors.primaryForeground';
        writer.writeLine(`${defaultColor},`);
        Array.from(fills[slug]).forEach((value: string[][]) => {
          const [rules, raw] = value;
          const condition = rules.map(ruleName => {
            const pressableState =  pressableStates[ruleName] as string;
            // TRIAGE: Skip default state
            //if (ruleName === '_stateDefault')
            //  return false;
            return pressableState && dynamic
              ? `(${ruleName} || ${pressableState})`
              : ruleName;
            }).filter(Boolean).join(' && ');
          const varNodeId = variants[raw.toString()];
          const fillToken = data.colorsheet[varNodeId];
          // console.log('[colors/rule]', raw, slug, fillToken, varNodeId);
          writer.writeLine(`${condition} && ${fillToken},`);
        });
      });
      writer.writeLine('].filter(Boolean).pop(),');
    }
  });

  // Cache props array
  const cacheProps = Array.from(props).map(p => `props.${p}`);
  writer.write(`), [${cacheProps.join(', ')}]);`);
  writer.blankLine();
}
