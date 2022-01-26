import CodeBlockWriter from 'code-block-writer';
import {getContent, getStyle, getName} from 'features/convert/parsers';
import type {CodeSettings} from 'types/config';
import type {TargetNode} from 'types/figma';

export function getComponentCode(component: TargetNode, settings?: CodeSettings) {
  if (!component) return;

  const {code, deps, styles} = getContent([...component.children]);
  const root = {tag: 'XStack', slug: 'root', style: getStyle(component)};
  const name = getName(component.name);
  const dependencies = ['XStack', ...deps].join(', ');
  const writer = new CodeBlockWriter(settings.output);

  const writeContents = (lines) => {
    lines.forEach((line) => {
      writer.write(`<${line.tag} style={styles.${line.slug}}>`).indent(() => {
        if (line.tag === 'Text') {
          writer.write('{t`');
          writer.write(line.value);
          writer.write('`}');
        } else if (line.tag === 'XStack') {
          writeContents(line.children);
        }
      });
      writer.writeLine(`</${line.tag}>`);
    });
  };

  if (deps.includes('Text')) {
    writer.write('import {t} from');
    writer.quote('@lingui/macro');
    writer.write(';');
    writer.newLine();
  }

  writer.write(`import {${dependencies}} from `);
  writer.quote('tamagui');
  writer.write(';');
  writer.newLine();

  writer.blankLine();

  writer.write(`export function ${name}()`).block(() => {
    writer.write(`return (`).indent(() => {
      writer.write(`<XStack style={styles.root}>`).indent(() => {
        writeContents(code);
      });
      writer.writeLine('</XStack>');
    });
    writer.writeLine(');');
  });
  writer.blankLine();
  writer.write(`const styles = `).block(() => {
    const properties = Object
      .keys(root.style)
      .filter(c => root.style[c] !== undefined);
    if (properties.length > 0) {
      writer.write(`${root.slug}: Styles.create${root.tag}Style({`).indent(() => {
        properties.forEach(property => {
          const value = root.style[property];
          writer.write(`${property}: `);
          if (typeof value === 'number') {
            writer.write(value.toString());
          } else {
            writer.quote(value);
          }
          writer.write(',');
          writer.newLine();
        });
      });
      writer.writeLine('}),');
    }
    Object.keys(styles).forEach(slug => {
      const child = styles[slug];
      if (child && child.tag !== 'Unknown') {
        const properties = Object
          .keys(child.style)
          .filter(c => child.style[c] !== undefined);
        if (properties.length > 0) {
          writer.write(`${slug}: Styles.create${child.tag}Style({`).indent(() => {
            properties.forEach(property => {
              const value = child.style[property];
              writer.write(`${property}: `);
              if (typeof value === 'number') {
                writer.write(value.toString());
              } else {
                writer.quote(value);
              }
              writer.write(',');
              writer.newLine();
            });
          });
          writer.writeLine('}),');
        }
      }
    });
  });

  return writer.toString();
}
