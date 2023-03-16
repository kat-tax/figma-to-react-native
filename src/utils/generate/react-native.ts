import CodeBlockWriter from 'code-block-writer';
import parseComponent from 'utils/parse';
import {propsToString} from 'utils/generate/helpers';
import {parseStyles} from 'utils/parse/style';
import {getName} from 'utils/parse/helpers';

import type {ParseState, ParseCode} from 'utils/parse';
import type {Settings} from 'types/settings';

export default function(component: SceneNode & ChildrenMixin, settings: Settings) {
  if (!component) return {name: '', code: ''};

  // DEBUG
  // console.log('component', component);

  const rootView: ParseCode = {
    id: component.id,
    tag: 'View',
    slug: 'root',
    name: getName(component.name),
    styles: parseStyles(component),
  };

  const code = generateCode(rootView, component.children, settings);
  const bundle = generateBundle(rootView, component.children, settings);

  return {name: rootView.name, code, bundle};
}

export function generateCode(
  rootView: ParseCode,
  children: readonly SceneNode[],
  settings: Settings,
) {
  const parsed = parseComponent([...children]);
  const writer = new CodeBlockWriter(settings.output?.format);
  const {components, primitives, libraries, stylesheet} = parsed.state;
  const imports = Object.entries(components).map((c: any) => c ? getName(c[1].name) : '').filter(Boolean);

  writeImports(writer, settings, primitives, libraries, imports);
  writer.blankLine();
  writeFunction(writer, rootView, parsed.code, settings);
  writer.blankLine();
  writeStyleSheet(writer, rootView, stylesheet);
  writer.blankLine();

  return writer.toString();
}

export function generateBundle(
  _rootView: ParseCode,
  _children: readonly SceneNode[],
  _settings: Settings,
) {
  // TODO
  // 1. Aggregate all primitives
  // 2. Aggregate all libraries
  // 3. DO NOT pass component imports (they will be all in one file)
  // 4. Generate code for root view and all component imports
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
}

function writeFunction(
  writer: CodeBlockWriter,
  rootView: ParseCode,
  children: ParseCode[],
  settings: Settings,
) {
  writer.write(`export function ${rootView.name}()`).block(() => {
    writer.write(`return (`).indent(() => {
      writer.write(`<${rootView.tag} style={styles.${rootView.slug}}>`).indent(() => {
        writeChildren(writer, children, settings);
      });
      writer.writeLine(`</${rootView.tag}>`);
    });
    writer.writeLine(');');
  });
}

function writeChildren(
  writer: CodeBlockWriter,
  children: ParseCode[],
  settings: Settings,
) {
  children.forEach((child) => {
    const attrStyle = child.slug ? ` style={styles.${child.slug}}` : '';
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
          const {r, g, b} = child.fills[i].color;
          const fill = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
          writer.write(`<Path d="${path.data}" fill="${fill}"/>`)
        });
      // View children (recurse)
      } else if (child.tag === 'View') {
        writeChildren(writer, child.children, settings);
      }
    });

    // Closing tag
    writer.writeLine(`</${child.tag}>`);
  });
}

function writeStyleSheet(
  writer: CodeBlockWriter,
  rootView: ParseCode,
  stylesheet: ParseState['stylesheet'],
  name: string = 'styles',
) {
  writer.write(`const ${name} = StyleSheet.create(`).inlineBlock(() => {
    const properties = Object
      .keys(rootView.styles)
      .filter(c => rootView.styles[c] !== undefined);
    if (properties.length > 0) {
      writer.write(`${rootView.slug}: {`).indent(() => {
        properties.forEach(property => {
          const value = rootView.styles[property];
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
}
