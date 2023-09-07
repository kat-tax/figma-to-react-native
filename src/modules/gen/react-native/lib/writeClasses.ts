import CodeBlockWriter from 'code-block-writer';
import {createIdentifierPascal, createIdentifierCamel} from 'common/string';
import {getPropName} from 'modules/fig/lib/getPropName';

import type {ParseData} from 'types/figma';

export function writeClasses(
  writer: CodeBlockWriter,
  data: ParseData,
  componentName: string,
  metadata: {
    stylePrefix: string,
    isPreview?: boolean, 
  }
) {
  writer.write(`const classes = `).inlineBlock(() => {
    Object.keys(data.variants).forEach((k: string) => {
      const mods = Object.keys(data.variants[k]).filter(v => !!data.variants[k][v]);
      if (mods.length > 0) {
        writer.write(`${k}: [`).indent(() => {
          writer.writeLine(`${metadata.stylePrefix}.${k},`);
          mods.reverse().forEach(v => {
            const parts = v.split(', ');
            const cond = parts.map(part => {
              const [state, value] = part.split('=');
              const enumId = `${componentName}${createIdentifierPascal(state)}`;
              return `props.${getPropName(state)} === ${enumId}.${createIdentifierPascal(value)}`
            }).join(' && ');
            const className = `${k}_${v}`.split(', ').join('_').replace(/\=/g, '_');
            writer.writeLine(`${cond} && ${metadata.stylePrefix}.${createIdentifierCamel(className)},`);
          });
        });
        writer.writeLine('],');
      }
    });
  });
  writer.write(';');
  writer.blankLine();
}

