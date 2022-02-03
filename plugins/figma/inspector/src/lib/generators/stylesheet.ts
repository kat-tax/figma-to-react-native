import type {Settings} from 'lib/types/settings';
import type {TargetNode} from 'lib/types/figma';
import CodeBlockWriter from 'code-block-writer';
import {getContent, getStyle, getName} from 'lib/parsers/figma';

export default function(component: TargetNode, settings: Settings) {
  if (!component) return {name: '', code: ''};

  const name = getName(component.name);
  const writer = new CodeBlockWriter(settings.output?.format);
  const {code, deps, styles} = getContent([...component.children]);
  const root = {tag: 'View', slug: 'root', style: getStyle(component)};
  const dependencies = ['View', ...deps].join(', ');

  const writeContents = (lines) => {
    lines.forEach((line) => {
      writer.write(`<${line.tag} style={styles.${line.slug}}>`).indent(() => {
        if (line.tag === 'Text') {
          if (settings.output?.react?.addTranslate) {
            writer.write('{t`');
            writer.write(line.value);
            writer.write('`}');
          } else {
            writer.write(line.value);
          }
        } else if (line.tag === 'View') {
          writeContents(line.children);
        }
      });
      writer.writeLine(`</${line.tag}>`);
    });
  };

  if (settings.output?.react?.addImport) {
    writer.write('import React from');
    writer.space();
    writer.quote('react');
    writer.write(';');
    writer.newLine();
  }

  if (settings.output?.react?.addTranslate && deps.includes('Text')) {
    writer.write('import {t} from');
    writer.space();
    writer.quote('@lingui/macro');
    writer.write(';');
    writer.newLine();
  }

  writer.write(`import {${dependencies}, StyleSheet} from`);
  writer.space();
  writer.quote('react-native');
  writer.write(';');
  writer.newLine();

  writer.blankLine();

  writer.write(`export function ${name}()`).block(() => {
    writer.write(`return (`).indent(() => {
      writer.write(`<${root.tag} style={styles.${root.slug}}>`).indent(() => {
        writeContents(code);
      });
      writer.writeLine(`</${root.tag}>`);
    });
    writer.writeLine(');');
  });
  writer.blankLine();
  writer.write(`const styles = StyleSheet.create(`).inlineBlock(() => {
    const properties = Object
      .keys(root.style)
      .filter(c => root.style[c] !== undefined);
    if (properties.length > 0) {
      writer.write(`${root.slug}: {`).indent(() => {
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
      writer.writeLine('},');
    }
    Object.keys(styles).forEach(slug => {
      const child = styles[slug];
      if (child && child.tag !== 'Unknown') {
        const properties = Object
          .keys(child.style)
          .filter(c => child.style[c] !== undefined);
        if (properties.length > 0) {
          writer.write(`${slug}: {`).indent(() => {
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
          writer.writeLine('},');
        }
      }
    });
  });
  writer.write(');');

  return {name, code: writer.toString()};
}
