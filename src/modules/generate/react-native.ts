import CodeBlockWriter from 'code-block-writer';
import {parseNodes} from 'modules/parse/nodes';
import {parseStyles} from 'modules/parse/style';
import {getName, propsToString} from 'utils/figma';

import type {ParseState, ParsedComponent} from 'modules/parse/nodes';
import type {EditorComponent} from 'types/editor';
import type {TargetNode} from 'types/figma';
import type {Settings} from 'types/settings';

export default function(component: TargetNode, settings: Settings): EditorComponent {
  if (!component) {
    return {name: '', code: '', bundle: ''};
  }

  const rootView: ParsedComponent = {
    id: component.id,
    tag: 'View',
    slug: 'root',
    name: getName(component.name),
    styles: parseStyles(component),
  };

  return {
    name: rootView.name,
    code: generateCode(rootView, component.children, settings),
    bundle: generateBundle(rootView, component.children, settings),
  };
}

export function generateCode(
  rootView: ParsedComponent,
  children: readonly SceneNode[],
  settings: Settings,
) {
  const parsed = parseNodes([...children]);
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
      styles: parseStyles(sub),
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
          const {r, g, b} = child.fills[i].color;
          const fill = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
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
