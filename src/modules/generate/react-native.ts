import CodeBlockWriter from 'code-block-writer';
import {parseNodes} from 'modules/parse/nodes';
import {parseStyles} from 'modules/parse/styles';
import {getName, getSlug, getColor, propsToString} from 'utils/figma';

import type {ParseData, ParseState, ParsedComponent} from 'types/parse';
import type {EditorComponent, EditorLinks} from 'types/editor';
import type {TargetNode} from 'types/figma';
import type {Settings} from 'types/settings';

export default function(component: TargetNode, settings: Settings, skipBundle?: boolean): EditorComponent {
  if (!component) {
    return {name: '',  code: '', theme: '', bundle: '', links: {}};
  }

  const rootView: ParsedComponent = {
    id: component.id,
    tag: 'View',
    slug: 'root',
    name: getName(component.name),
    styles: parseStyles(component, true),
  };

  const parsed = parseNodes([...component.children]);
  const links: EditorLinks = {};
  Object.entries(parsed.state.components).forEach((c: any) => {
    links[getName(c[1].name)] = c[0];
  });

  return {
    name: rootView.name,
    code: generateCode(rootView, parsed, settings),
    theme: generateTheme(settings),
    bundle: !skipBundle ? generateBundle(rootView, component.children, settings) : '',
    links,
  };
}

export function generateCode(
  rootView: ParsedComponent,
  parsed: ParseData,
  settings: Settings,
) {
  const writer = new CodeBlockWriter(settings.output?.format);
  const {components, stylesheet, primitives, libraries} = parsed.state;
  const imports = Object.entries(components)
    .map((c: any) => c ? getName(c[1].name) : '')
    .filter(Boolean);

  writeImports(writer, settings, primitives, libraries, imports);
  writer.blankLine();
  writeFunction(writer, settings, rootView, parsed.code);
  writer.blankLine();
  writeStyleSheet(writer, rootView, stylesheet);
  writer.blankLine();

  return writer.toString();
}

export function generateTheme(settings: Settings) {
  type ThemeColors = Record<string, Record<string, ThemeColor>>;
  type ThemeColor = {value: string, comment: string};

  // Create theme writer
  const writer = new CodeBlockWriter(settings.output?.format);
  
  // Write color map
  const colors: ThemeColors = {};
  let maxLineLength = 0;
  figma.getLocalPaintStyles().forEach(paint => {
    const [group, token] = paint.name.split('/');
    const name = getSlug(token, true);

    // If the group of colors doesn't exist, initialize it
    if (!colors[group]) {
      colors[group] = {};
    }

    // Insert this color into the color group
    // @ts-ignore (TODO: why the fuck is typescript saying there isn't a color prop?)
    const value = colorToCSS(paint.paints[0].color);
    maxLineLength = Math.max(maxLineLength, name.length + value.length);
    colors[group][name] = {value, comment: paint.description};

  });

  writer.write(`export const colors = `).inlineBlock(() => {
    Object.keys(colors).forEach(group => {
      writer.write(`${getSlug(group)}: `).inlineBlock(() => {
        Object.keys(colors[group]).forEach(name => {
          const color: ThemeColor = colors[group][name];
          writer.write(`$${name}: `);
          writer.quote(color.value);
          writer.write(`,`);
          if (color.comment) {
            const padding = (' ').repeat(maxLineLength - (name.length + color.value.length));
            writer.write(`${padding}// ${color.comment}`);
          }
          writer.newLine();
        });
        writer.newLineIfLastNot();
      });
      writer.write(',');
      writer.newLine();
    });
  });
  writer.write(';');
  writer.newLine();

  return writer.toString();
}

export function generateBundle(
  rootView: ParsedComponent,
  children: readonly SceneNode[],
  settings: Settings,
) {
  const parsed = parseNodes([...children]);
  const writer = new CodeBlockWriter(settings.output?.format);
  const {components, stylesheet} = parsed.state;
  const primitives = new Set(['Text', 'Image']);
  const libraries = new Set(['react-native-svg']);
  
  writeImports(writer, settings, primitives, libraries);
  writer.blankLine();
  writer.write(generateTheme(settings));
  writer.blankLine();
  writeFunction(writer, settings, rootView, parsed.code);
  writer.blankLine();
  writeStyleSheet(writer, rootView, stylesheet);
  writer.blankLine();
  writeComponents(writer, settings, components);
  writer.blankLine();

  return writer.toString();
}

function writeImports(
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
    writer.quote(`./${component}.tsx`);
    writer.write(';');
    writer.newLine();
  });

  // Import theme file
  writer.write(`import {colors} from`);
  writer.space();
  writer.quote(`./theme.ts`);
  writer.write(';');
  writer.newLine();
}

function writeComponents(
  writer: CodeBlockWriter,
  settings: Settings,
  components?: string[],
) {
  Object.values(components).forEach((sub: any) => {
    const subRootView: ParsedComponent = {
      id: sub.id,
      tag: 'View',
      slug: 'root',
      name: getName(sub.name),
      styles: parseStyles(sub, true),
    };

    const styleid = '_' + sub.id.split(':').join('_');
    const parsed = parseNodes([...sub.children]);

    writeFunction(writer, settings, subRootView, parsed.code, styleid);
    writer.blankLine();
    writeStyleSheet(writer, subRootView, parsed.state.stylesheet, styleid);
    writer.blankLine();
    writeComponents(writer, settings, parsed.state.components);
  });
}

function writeFunction(
  writer: CodeBlockWriter,
  settings: Settings,
  rootView: ParsedComponent,
  children: ParsedComponent[],
  styleid: string = 'styles',
) {
  writer.write(`export function ${rootView.name}()`).block(() => {
    // writeInteractionStyle(writer, rootView, styleid);
    writer.write(`return (`).indent(() => {
      writer.write(`<${rootView.tag} style={${styleid}.${rootView.slug}}>`).indent(() => {
        writeChildren(writer, settings, children, styleid);
      });
      writer.writeLine(`</${rootView.tag}>`);
    });
    writer.writeLine(');');
  });
}

function writeChildren(
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

function writeStyleSheet(
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

function writeInteractionStyle(
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
