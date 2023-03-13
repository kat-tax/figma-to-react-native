import CodeBlockWriter from 'code-block-writer';
import parseComponent from 'utils/parse';
import {getStyle} from 'utils/parse/style';
import {getName, getSlug} from 'utils/parse/helpers';

import type {Settings} from 'types/settings';
import type {TargetNode} from 'types/figma';

export default function(component: TargetNode, settings: Settings) {
  if (!component) return {name: '', code: ''};

  const {code, deps, styles, components} = parseComponent([...component.children]);
  const writer = new CodeBlockWriter(settings.output?.format);
  const name = getName(component.name);

  const rootView = {tag: 'View', slug: 'root', style: getStyle(component)};
  const primitives = ['View', ...deps].join(', ');
  const imports = Object.entries(components).map(([_id, value]) => {
    const node: any = value;
    if (!node) return false;
    return getName(node.name);
  }).filter(Boolean);

  const writeContents = (lines) => {
    lines.forEach((line) => {
      // Has a child node
      if (line.value || line.children) {
        writer.write(`<${line.tag} style={styles.${line.slug}}>`).indent(() => {
          // Text child
          if (line.tag === 'Text') {
            if (settings.output?.react?.addTranslate) {
              writer.write('{t`' + line.value  + '`}');
            } else {
              writer.write(line.value);
            }
          // View children
          } else if (line.tag === 'View') {
            writeContents(line.children);
          }
        });
        writer.writeLine(`</${line.tag}>`);

      // No child node, possibly properties
      } else {
        const props = line.props ? ' ' + Object.entries(line.props)
          // Sort by booleans first
          .sort((a: any, b: any) => a[1].type === 'BOOLEAN' ? -1 : 1)
          // Map props to JSX keys
          .map(([key, prop]) => {
            const {value, type}: any = prop;
            const name = getSlug(key.split('#').shift());
            // Boolean prop (shorthand, don't include if false)
            if (type === 'BOOLEAN' && value === true) {
              return name;
            // Variant or text prop
            } else if (type === 'TEXT' || type === 'VARIANT') {
              return `${name}="${value}"`;
            }
          }).filter(Boolean).join(' ') : '';
        writer.writeLine(`<${line.tag}${props}/>`);
      }
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
  if (settings.output?.react?.addTranslate && deps.includes('Text')) {
    writer.write('import {t} from');
    writer.space();
    writer.quote('@lingui/macro');
    writer.write(';');
    writer.newLine();
  }

  // Primitive imports
  writer.write(`import {StyleSheet, ${primitives}} from`);
  writer.space();
  writer.quote('react-native');
  writer.write(';');
  writer.newLine();

  // Component imports
  imports.forEach(component => {
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
      writer.write(`<${rootView.tag} style={styles.${rootView.slug}}>`).indent(() => {
        writeContents(code);
      });
      writer.writeLine(`</${rootView.tag}>`);
    });
    writer.writeLine(');');
  });

  writer.blankLine();

  // Component stylesheet
  writer.write(`const styles = StyleSheet.create(`).inlineBlock(() => {
    const properties = Object
      .keys(rootView.style)
      .filter(c => rootView.style[c] !== undefined);
    if (properties.length > 0) {
      writer.write(`${rootView.slug}: {`).indent(() => {
        properties.forEach(property => {
          const value = rootView.style[property];
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

  // Return component name and code
  return {name, code: writer.toString()};
}
