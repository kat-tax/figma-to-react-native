import CodeBlockWriter from 'code-block-writer';
import {createIdentifierCamel} from 'common/string';

import type {ParseData} from 'types/parse';
import type {Settings} from 'types/settings';

export function writeStyleSheet(
  writer: CodeBlockWriter,
  data: ParseData,
  _settings: Settings,
  metadata: {
    stylePrefix: string,
    isPreview?: boolean, 
  },
  includeFrame?: boolean,
) {
  const _writeStyleSheet = () => {
    const define = metadata.isPreview ? '' : 'const ';
    writer.write(`${define}${metadata.stylePrefix} = createStyles(theme => (`).inlineBlock(() => {
      // Frame styles
      if (includeFrame && data.frame)
        writeStyle(writer, 'frame', data.stylesheet[data.frame.node.id]);
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
  };

  if (metadata.isPreview) {
    writer.writeLine(`let ${metadata.stylePrefix} = {}`);
    writer.write('try ').inlineBlock(() => {
      _writeStyleSheet();
    });
    writer.write(' catch (e) ').inlineBlock(() => {
      writer.writeLine([
        'logtail.error(e)',
        'logtail.flush()',
        'console.error("[preview] [styles]", e)',
      ].join('; '));
    });
  } else {
    _writeStyleSheet();
  }

}

export function writeStyle(writer: CodeBlockWriter, slug: string, styles: any) {
  const props = Object.keys(styles);
  if (props.length > 0) {
    writer.write(`${slug}: {`).indent(() => {
      props.forEach(prop => {
        const value = styles[prop];
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
        // Other props (TODO: document this)
        } else {
          writer.write(`${prop}: `);
          if (typeof value === 'undefined') {
            writer.quote('unset');
          } else if (typeof value === 'number') {
            writer.write(Number.isInteger(value)
              ? value.toString()
              : parseFloat(value.toFixed(5)).toString()
            );
          } else if (typeof value === 'string' && value.startsWith('theme.')) {
            writer.write(value);
          } else if (value?.type === 'runtime' && value?.name === 'var') {
            writer.write('theme.colors.' + createIdentifierCamel(value.arguments[0]));
          } else {
            writer.quote(value);
          }
          writer.write(',');
          writer.newLine();
        }
      });
    });
    writer.writeLine('},');
  }
}
