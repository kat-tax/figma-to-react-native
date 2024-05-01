import CodeBlockWriter from 'code-block-writer';
import {createIdentifierCamel} from 'common/string';
import {getColor} from 'backend/fig/lib';

import type {ParseData} from 'types/parse';
import type {ImportFlags} from './writeImports';

export function writeStyleSheet(
  writer: CodeBlockWriter,
  flags: ImportFlags,
  data: ParseData,
): ImportFlags {
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
  });
  writer.write('));');
  writer.newLine();
  writer.blankLine();
  return flags;
}

export function writeStyle(writer: CodeBlockWriter, slug: string, styles: any) {
  const props = styles && Object.keys(styles);
  if (props?.length > 0) {
    writeProps(props, writer, slug, styles);
  }
}

export function writeProps(props: string[], writer: CodeBlockWriter, slug: string, styles: any) {
  writer.write(`${slug}: {`).indent(() => {
    props.forEach(prop => {
      writeProp(prop, styles[prop], writer);
    });
  });
  writer.writeLine('},');
}

export function writeProp(
  prop: string,
  value: unknown,
  writer: CodeBlockWriter,
) {
  // Expand shorthand props
  // TODO: expansion shouldn't be done here, can't diff this way
  if (prop === 'border') {
    writeExpandedBorderProps(writer, value);
  // Other props
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
        writer.write(val.join('.'));
      // String values
      } else if (typeof val === 'string') {
        writer.quote(val);
      // Unknown value
      } else {
        writer.write(JSON.stringify(val));
      }
    }
    writer.write(',');
    writer.newLine();
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
  const variable = runtime.arguments[1][0]?.value;
  switch (variable?.type) {
    case 'rgb':
      const {r,g,b,alpha} = variable;
      if (alpha === 1) {
        return `rgb(${r},${g},${b})`
      } else {
        return `rgba(${r},${g},${b},${alpha})`;
      }
    default:
      return variable?.value ?? variable;
  }
}

function writeExpandedBorderProps(writer: CodeBlockWriter, value: unknown) {
  if (Array.isArray(value)) {
    const [width, style, color] = value;
    const val = isRuntimeVar(color) ? getRuntimeVar(color) : color;
    writer.writeLine(`borderWidth: ${width},`);
    writer.write(`borderStyle: `);
    writer.quote(style);
    writer.write(',');
    writer.newLine();
    writer.write(`borderColor: `);
    writer.quote(val);
    writer.write(',');
    writer.newLine();
  } else {
    writer.writeLine(`borderWidth: 'unset' as any,`);
    writer.writeLine(`borderStyle: 'unset' as any,`);
    writer.writeLine(`borderColor: 'unset' as any,`);
  }
}