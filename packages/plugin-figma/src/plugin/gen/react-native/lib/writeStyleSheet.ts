import CodeBlockWriter from 'code-block-writer';
import {createIdentifierCamel} from 'common/string';

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
  if (props.length > 0) {
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
  value: any,
  writer: CodeBlockWriter
) {
  // Expand shorthand props
  // TODO: shouldn't be done here, can't diff this way
  if (prop === 'border') {
    if (Array.isArray(value)) {
      const [width, style, color] = value;
      const colorVal = color?.type === 'runtime' && color?.name === 'var'
        ? `theme.colors.${createIdentifierCamel(color.arguments[0])}`
        : color;
      writer.writeLine(`borderWidth: ${width},`);
      writer.write(`borderStyle: `);
      writer.quote(style);
      writer.write(',');
      writer.writeLine(`borderColor: ${colorVal},`);
    } else {
      writer.writeLine(`borderWidth: 'unset',`);
      writer.writeLine(`borderStyle: 'unset',`);
      writer.writeLine(`borderColor: 'unset',`);
    }
  // Other props
  } else {
    writer.write(`${prop}: `);
    // Undefined values
    if (typeof value === 'undefined') {
      writer.quote('unset');
    // Number values
    } else if (typeof value === 'number') {
      writer.write(Number.isInteger(value)
        ? value.toString()
        : parseFloat(value.toFixed(5)).toString()
      );
    // Theme values (local styles)
    } else if (typeof value === 'string' && value.startsWith('theme.')) {
      writer.write(value);
    // Runtime values (variables)
    } else if (value?.type === 'runtime' && value?.name === 'var') {
      writer.write('theme.colors.' + createIdentifierCamel(value.arguments[0]));
    // String values
    } else if (typeof value === 'string') {
      writer.quote(value);
    // Object values
    } else {
      writer.write(JSON.stringify(value));
      //writer.write(JSON.stringify(value));
    }
    writer.write(',');
    writer.newLine();
  }
}
