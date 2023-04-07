import CodeBlockWriter from 'code-block-writer';
import {getColor, propsToString} from 'utils/figma';

import type {ParsedComponent, ParseState} from 'types/parse';
import type {Settings} from 'types/settings';

export function writeImports(
  writer: CodeBlockWriter,
  settings: Settings,
  primitives: Set<string>,
  libraries?: Set<string>,
  components?: string[],
) {
  // Import React explicitly if set 
  if (settings.output?.react?.addImport) {
    writer.write('import React from');
    writer.space();
    writer.quote('react');
    writer.write(';');
    writer.newLine();
  }

  // Import LinguiJS if set and Text primitive is used
  if (settings.output?.react?.addTranslate && primitives.has('Text')) {
    writer.write('import {t} from');
    writer.space();
    writer.quote('@lingui/macro');
    writer.write(';');
    writer.newLine();
  }

  // Import primitives
  writer.write(`import {StyleSheet, ${['View', ...primitives].join(', ')}} from`);
  writer.space();
  writer.quote('react-native');
  writer.write(';');
  writer.newLine();

  // Import libraries
  libraries?.forEach(library => {
    writer.write(`import {Svg, Path} from`);
    writer.space();
    writer.quote(library);
    writer.write(';');
    writer.newLine();
  });

  // Import subcomponents
  components?.forEach(component => {
    writer.write(`import {${component}} from`);
    writer.space();
    writer.quote(`./${component}`);
    writer.write(';');
    writer.newLine();
  });

  // Import theme file
  writer.write(`import {colors} from`);
  writer.space();
  writer.quote(`./theme`);
  writer.write(';');
  writer.newLine();
}

export function writeFunction(
  writer: CodeBlockWriter,
  settings: Settings,
  rootView: ParsedComponent,
  children: ParsedComponent[],
  styleid: string = 'styles',
) {
  writer.write(`export function ${rootView.name}()`).block(() => {
    writer.write(`return (`).indent(() => {
      writer.write(`<${rootView.tag} style={${styleid}.${rootView.slug}}>`).indent(() => {
        writeChildren(writer, settings, children, styleid);
      });
      writer.writeLine(`</${rootView.tag}>`);
    });
    writer.writeLine(');');
  });
}

export function writeChildren(
  writer: CodeBlockWriter,
  settings: Settings,
  children: ParsedComponent[],
  styleid: string = 'styles',
) {
  children.forEach((child) => {
    const attrStyle = child.slug ? ` style={${styleid}.${child.slug}}` : '';
    const attrRect = child.box ? ` width="${child.box.width}" height="${child.box.height}"` : '';
    const attrProps = propsToString(child.props);
    const tagString = child.tag + attrStyle + attrRect + attrProps;

    // No children
    if (!child.value && !child.children && !child.paths) {
      writer.writeLine(`<${tagString}/>`);
      return;
    }

    // Child nodes
    writer.write(`<${tagString}>`).indent(() => {
      // Text child
      if (child.tag === 'Text') {
        if (settings.output?.react?.addTranslate) {
          writer.write('{t`' + child.value  + '`}');
        } else {
          writer.write('{`' + child.value + '`}');
        }
      // SVG child paths
      } else if (child.paths) {
        child.paths.forEach((path: any, i: number) => {
          const fill = getColor(child.fills[i].color);
          writer.write(`<Path d="${path.data}" fill="${fill}"/>`)
        });
      // View children (recurse)
      } else if (child.tag === 'View') {
        writeChildren(writer, settings, child.children);
      }
    });

    // Closing tag
    writer.writeLine(`</${child.tag}>`);
  });
}

export function writeStyleSheet(
  writer: CodeBlockWriter,
  rootView: ParsedComponent,
  stylesheet: ParseState['stylesheet'],
  styleid: string = 'styles',
) {
  writer.write(`const ${styleid} = StyleSheet.create(`).inlineBlock(() => {
    const properties = Object
      .keys(rootView.styles)
      .filter(c => rootView.styles[c] !== undefined);
    if (properties.length > 0) {
      writer.write(`${rootView.slug}: {`).indent(() => {
        properties.forEach(property => {
          const value = rootView.styles[property];
          writer.write(`${property}: `);
          if (typeof value === 'number' || value.startsWith('colors.')) {
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
    Object.keys(stylesheet).forEach(slug => {
      const child = stylesheet[slug];
      if (child && child.tag !== 'Unknown') {
        const properties = Object
          .keys(child.style)
          .filter(c => child.style[c] !== undefined);
        if (properties.length > 0) {
          writer.write(`${slug}: {`).indent(() => {
            properties.forEach(property => {
              const value = child.style[property];
              writer.write(`${property}: `);
              if (typeof value === 'number' || value.startsWith('colors.')) {
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
}

export function writeInteractionStyle(
  writer: CodeBlockWriter,
  rootView: ParsedComponent,
  styleid: string = 'styles',
) {
  /*
    ({hovered, pressed, focused}) => [
      styles.example,
      hovered && styles.exampleHover,
      pressed && styles.examplePressed,
      focused && styles.exampleFocused,
    ],
  */
  const hasHover = true;
  const hasPressed = true;
  const hasFocused = true;
  const actions = [
    hasHover && 'hovered',
    hasPressed && 'pressed',
    hasFocused && 'focused',
  ].filter(Boolean).join(', ');

  writer.write(`({${actions}}) = [`).inlineBlock(() => {
    const rules = Object
      .keys(rootView.styles)
      .filter(c => rootView.styles[c] !== undefined);
    if (rules.length > 0) {
      rules.forEach(rule => {
        writer.writeLine(`${styleid}.${rule},`);
        hasHover && writer.write(`${styleid}.${rule}Hover,`);
        hasPressed && writer.write(`${styleid}.${rule}Pressed,`);
        hasFocused && writer.write(`${styleid}.${rule}Focused,`);
      });
    }
  });

  writer.write('],');
  writer.newLine();
}
