import CodeBlockWriter from 'code-block-writer';
import {createIdentifierCamel} from 'common/string';
import {diff} from 'deep-object-diff';

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
    writeStyle(writer, 'root', data.stylesheet[data.root.node.id]);
    const rootVariants = data.variants?.classes?.root;
    if (rootVariants) {
      Object.keys(rootVariants).forEach(key => {
        const classKey = rootVariants[key];
        const classStyle = data.stylesheet[classKey];
        if (classStyle) {
          const className = createIdentifierCamel(`root_${key}`.split(', ').join('_'));
          writeStyle(writer, className, classStyle);
        }
      });
    }

    // Children styles
    for (const child of data.children) {
      const childStyles = data.stylesheet[child.node.id];
      if (childStyles) {
        writeStyle(writer, child.slug, childStyles);
        const childVariants = data.variants?.classes[child.slug];
        if (childVariants) {
          Object.keys(childVariants).forEach(key => {
            const classStyle = data.stylesheet[childVariants[key]];
            if (classStyle) {
              const className = createIdentifierCamel(`${child.slug}_${key}`.split(', ').join('_'));
              writeStyle(writer, className, classStyle);
            }
          });
        }
      }
    }

    // Children icon props
    for (const child of data.children) {
      const childIconData = data.meta.icons[child.node.id];
      if (childIconData) {
        // TEMP: Workaround to prevent placeholder from overriding instance icons
        if (childIconData.name.includes(':placeholder'))
          delete childIconData.name;
        writeStyle(writer, child.slug, childIconData);
        const iconVariants = data.variants?.icons[child.slug];
        if (iconVariants) {
          Object.entries(iconVariants).forEach(([key, childVariantIconData]) => {
            // TEMP: Workaround to prevent placeholder from overriding instance icons
            if (childVariantIconData.name.includes(':placeholder'))
              delete childVariantIconData.name;
            const className = createIdentifierCamel(`${child.slug}_${key}`.split(', ').join('_'));
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

export function writeProp(writer: CodeBlockWriter, prop: string, value: unknown) {
  // Expand shorthand props
  // TODO: Refactor the css-to-rn converter to not use shorthand, this is unstable
  if (prop === 'border') {
    writeExpandedBorderProps(writer, value);
  } else {
    writer.write(`${prop}: `);
    // Undefined values
    if (typeof value === 'undefined' || value === 'unset') {
      writer.quote('unset')
      writer.write(' as any');
    } else {
      const val = isRuntimeVar(value) ? getRuntimeVar(value) : value;
      // Number values
      if (typeof val === 'number') {
        // Hack: font weight needs to be a string
        if (prop === 'fontWeight') {
          writer.quote(val.toString());
        // Round numbers from figma
        } else {
          writer.write(Number.isInteger(val)
            ? val.toString()
            : parseFloat(val.toFixed(5)).toString()
          );
        }
      // Code syntax array (variables)
      } else if (Array.isArray(val)) {
        // TODO: Refactor the filter, this is needed to due css-to-rn using shorthand
        writer.write(val.filter(i => typeof i === 'string').join('.'));
      // String values
      } else if (typeof val === 'string') {
        if (val.startsWith('theme.')) {
          writer.write(val);
        } else {
          writer.quote(val);
        }
      // Unknown value
      } else {
        writer.write(JSON.stringify(val));
      }
    }
    writer.write(',');
    writer.newLine();
  }
}

function writeExpandedBorderProps(writer: CodeBlockWriter, value: unknown) {
  if (Array.isArray(value)) {
    const [width, style, color] = value;
    writer.writeLine(`borderWidth: ${width},`);
    writer.write(`borderStyle: `);
    writer.quote(style);
    writer.write(',');
    writer.newLine();
    writer.write(`borderColor: `);
    if (isRuntimeVar(color)) {
      writer.write(getRuntimeVar(color));
    } else {
      writer.quote(color);
    }
    writer.write(',');
    writer.newLine();
  } else {
    writer.writeLine(`borderWidth: 'unset' as any,`);
    writer.writeLine(`borderStyle: 'unset' as any,`);
    writer.writeLine(`borderColor: 'unset' as any,`);
  }
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

function getRuntimeVar(runtime: RuntimeVariable) {
  const variable = runtime.arguments[0];
  return variable.slice(2).replace(/\-/g, '.');
}
