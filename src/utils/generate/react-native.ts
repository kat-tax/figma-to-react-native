import CodeBlockWriter from 'code-block-writer';
import parseComponent from 'utils/parse';
import {parseStyles} from 'utils/parse/style';
import {getName} from 'utils/parse/helpers';
import {propsToString} from 'utils/generate/helpers';

import type {Settings} from 'types/settings';
import type {TargetNode} from 'types/figma';

export default function(component: TargetNode, settings: Settings) {
  if (!component) return {name: '', code: ''};

  // DEBUG
  // console.log('component', component);

  const writer = new CodeBlockWriter(settings.output?.format);
  // @ts-ignore
  const parsed = parseComponent([...component.children]);
  const name = getName(component.name);

  const root = {tag: 'View', slug: 'root', style: parseStyles(component)};
  const primitives = ['View', ...parsed.state.primitives].join(', ');
  const components = Object.entries(parsed.state.components).map(([_id, value]) => {
    const node: any = value;
    if (!node) return false;
    return getName(node.name);
  }).filter(Boolean);

  const writeContents = (lines) => {
    lines.forEach((line) => {
      const attrStyle = line.slug ? ` style={styles.${line.slug}}` : '';
      const attrRect = line.box ? ` width="${line.box.width}" height="${line.box.height}"` : '';
      const attrProps = propsToString(line.props);
      const tagString = line.tag + attrStyle + attrRect + attrProps;

      // No children
      if (!line.value && !line.children && !line.paths) {
        writer.writeLine(`<${tagString}/>`);
        return;
      }

      // Child nodes
      writer.write(`<${tagString}>`).indent(() => {
        // Text child
        if (line.tag === 'Text') {
          if (settings.output?.react?.addTranslate) {
            writer.write('{t`' + line.value  + '`}');
          } else {
            writer.write('{`' + line.value + '`}');
          }
        // SVG child paths
        } else if (line.paths) {
          line.paths.forEach((path: any, i: number) => {
            const {r, g, b} = line.fills[i].color;
            const fill = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
            writer.write(`<Path d="${path.data}" fill="${fill}"/>`)
          });
        // View children (recurse)
        } else if (line.tag === 'View') {
          writeContents(line.children);
        }
      });

      // Closing tag
      writer.writeLine(`</${line.tag}>`);
    });
  };

  // Import React explicitly if set 
  if (settings.output?.react?.addImport) {
    writer.write('import React from');
    writer.space();
    writer.quote('react');
    writer.write(';');
    writer.newLine();
  }

  // Import LinguiJS if set and Text primitive is used
  if (settings.output?.react?.addTranslate && parsed.state.primitives.has('Text')) {
    writer.write('import {t} from');
    writer.space();
    writer.quote('@lingui/macro');
    writer.write(';');
    writer.newLine();
  }

  // Import primitives
  writer.write(`import {StyleSheet, ${primitives}} from`);
  writer.space();
  writer.quote('react-native');
  writer.write(';');
  writer.newLine();

  // Import libraries
  parsed.state.libraries.forEach(library => {
    writer.write(`import {Svg, Path} from`);
    writer.space();
    writer.quote(library);
    writer.write(';');
    writer.newLine();
  });

  // Import subcomponents
  components.forEach(component => {
    writer.write(`import {${component}} from`);
    writer.space();
    writer.quote(`./${component}.tsx`);
    writer.write(';');
    writer.newLine();
  });

  writer.blankLine();

  // Component function
  writer.write(`export function ${name}()`).block(() => {
    writer.write(`return (`).indent(() => {
      writer.write(`<${root.tag} style={styles.${root.slug}}>`).indent(() => {
        writeContents(parsed.code);
      });
      writer.writeLine(`</${root.tag}>`);
    });
    writer.writeLine(');');
  });

  writer.blankLine();

  // Component stylesheet
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
    Object.keys(parsed.state.stylesheet).forEach(slug => {
      const child = parsed.state.stylesheet[slug];
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

  // Return component name and code
  return {name, code: writer.toString()};
}
