import CodeBlockWriter from 'code-block-writer';
import {diff} from 'deep-object-diff';

import * as string from 'common/string';

import type {ImportFlags} from './writeImports';
import type {ParseData} from 'types/parse';

export async function writeStyleSheet(
  writer: CodeBlockWriter,
  flags: ImportFlags,
  data: ParseData,
): Promise<ImportFlags> {
  flags.unistyles.createStyleSheet = true;

  writer.write(`const stylesheet = createStyleSheet(theme => (`).inlineBlock(() => {
    // Root styles
    const rootStyles = data.stylesheet[data.root.node.id];
    if (rootStyles) {
      writeStyle(writer, 'root', rootStyles);
      const rootVariants = data.variants?.classes?.root;
      if (rootVariants) {
        Object.keys(rootVariants).forEach(key => {
          const rootVariantStyles = data.stylesheet[rootVariants[key]];
          if (rootVariantStyles) {
            const diffStyles = diff(rootStyles, rootVariantStyles);
            for (const k in diffStyles) {
              if (diffStyles[k] === undefined) {
                diffStyles[k] = 'unset';
              }
            }
            if (diffStyles && Object.keys(diffStyles).length > 0) {
              const className = string.createIdentifierCamel(`root_${key}`.split(', ').join('_'));
              writeStyle(writer, className, diffStyles);
            }
          }
        });
      }
    }

    // Children styles
    for (const child of data.children) {
      const childStyles = data.stylesheet[child.node.id];
      if (childStyles) {
        writeStyle(writer, child.slug, childStyles);
        const childVariants = data.variants?.classes[child.slug];
        if (childVariants) {
          Object.keys(childVariants).forEach(key => {
            const childVariantStyles = data.stylesheet[childVariants[key]];
            if (childVariantStyles) {
              const diffStyles = diff(childStyles, childVariantStyles);
              for (const k in diffStyles) {
                if (diffStyles[k] === undefined) {
                  diffStyles[k] = 'unset';
                }
              }
              if (diffStyles && Object.keys(diffStyles).length > 0) {
                const className = string.createIdentifierCamel(`${child.slug}_${key}`.split(', ').join('_'));
                writeStyle(writer, className, diffStyles);
              }
            }
          });
        }
      }
    }

    // Children icon props
    for (const child of data.children) {
      const childIconData = data.meta.icons[child.node.id];
      if (childIconData) {
        // TODO: Workaround to prevent placeholder from overriding instance icons
        if (childIconData.name.includes(':placeholder'))
          delete childIconData.name;
        writeStyle(writer, child.slug, childIconData);
        const iconVariants = data.variants?.icons[child.slug];
        if (iconVariants) {
          Object.entries(iconVariants).forEach(([key, childVariantIconData]) => {
            // TODO: Workaround to prevent placeholder from overriding instance icons
            if (childVariantIconData.name.includes(':placeholder'))
              delete childVariantIconData.name;
            const className = string.createIdentifierCamel(`${child.slug}_${key}`.split(', ').join('_'));
            writeStyle(writer, className, diff(childIconData, childVariantIconData));
          });
        }
      }
    }
  });
  writer.write('));');
  writer.newLine();
  writer.blankLine();
  return flags;
}

export function writeStyle(writer: CodeBlockWriter, slug: string, styles: any) {
  const props = styles && Object.keys(styles);
  if (props?.length > 0) {
    writeProps(writer, props, slug, styles);
  }
}

export function writeProps(writer: CodeBlockWriter,props: string[], slug: string, styles: any) {
  writer.write(`${slug}: {`).indent(() => {
    props.forEach(prop => {
      writeProp(writer, prop, styles[prop]);
    });
  });
  writer.writeLine('},');
}

export function writeProp(writer: CodeBlockWriter, prop: string, val: unknown) {
  writer.write(`${prop}: `);
  // Undefined values
  if (typeof val === 'undefined' || val === 'unset') {
    writer.quote('unset')
    writer.write(' as any');
  } else {
    const value = isRuntimeVar(val) ? getRuntimeVar(val) : val;
    // Number values
    if (typeof value === 'number') {
      // Hack: font weight needs to be a string
      if (prop === 'fontWeight') {
        writer.quote(value.toString());
      // Round numbers from figma
      } else {
        writer.write(Number.isInteger(value)
          ? value.toString()
          : parseFloat(value.toFixed(5)).toString()
        );
      }
    // String values
    } else if (typeof value === 'string') {
      // Theme values
      if (value.startsWith('theme.')) {
        writer.write(value);
      } else {
        writer.quote(value);
      }
    // Unknown value
    } else {
      writer.write(JSON.stringify(value));
    }
  }
  writer.write(',');
  writer.newLine();
}

type RuntimeVariable = {
  type: 'runtime',
  name: 'var',
  arguments: [string, any],
}

function isRuntimeVar(value: any): value is RuntimeVariable {
  return value?.type === 'runtime'
    && value?.name === 'var'
    && Array.isArray(value?.arguments)
    && value.arguments.length === 2;
}

function getRuntimeVar(runtime: any) {
  const variable = runtime.arguments[0];
  return variable.slice(2).replace(/\-/g, '.');
}
