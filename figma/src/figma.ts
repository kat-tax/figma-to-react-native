import CodeBlockWriter from 'code-block-writer';

export function getCode(component) {
  const {code, deps, styles} = getContent([...component.children]);
  const root = {tag: 'View', slug: 'root', style: getStyle(component)};
  const name = getName(component.name);
  const dependencies = ['Styles', 'View', ...deps].join(', ');
  const writer = new CodeBlockWriter({
    newLine: "\r\n",         // default: "\n"
    useTabs: false,          // default: false
    useSingleQuote: false,   // default: false
    indentNumberOfSpaces: 2, // default: 4
  });

  const writeContents = (lines) => {
    lines.forEach((line) => {
      writer.write(`<${line.tag} style={styles.${line.slug}}>`).indent(() => {
        if (line.tag === 'Text') {
          writer.write('{');
          writer.quote(line.value);
          writer.write('}');
        } else if (line.tag === 'View') {
          writeContents(line.children);
        }
      });
      writer.writeLine(`</${line.tag}>`);
    });
  };

  writer.write('import React from ');
  writer.quote('react');
  writer.write(';');
  writer.newLine();
  writer.write(`import {${dependencies}} from `);
  writer.quote('react-ult');
  writer.write(';');
  writer.newLine();
  writer.blankLine();
  writer.write(`export function ${name}()`).block(() => {
    writer.write(`return (`).indent(() => {
      writer.write(`<View style={styles.root}>`).indent(() => {
        writeContents(code);
      });
      writer.writeLine('</View>');
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

export function getTarget(selection: readonly SceneNode[]) {
  let root: SceneNode | DocumentNode & ChildrenMixin = selection[0];
  if (root.type === 'COMPONENT') return selection[0];
  while (root.parent && root.parent.type !== 'PAGE') {
    root = root.parent;
    if (root.type === 'COMPONENT') return root;
  }
  return null;
}

function getStyle(component) {
  const isText = component.type === 'TEXT';
  const isGroup = component.type === 'GROUP';
  const isComponent = component.type === 'COMPONENT';

  let styles = {};

  if (isComponent || isGroup) {
    let backgroundColor: string;
    if (component.backgrounds.length > 0) {
      const {r, g, b} = component.backgrounds[0].color;
      backgroundColor = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
    }
    styles = {
      ...styles,
      backgroundColor,
    };
    /*
      const flexbox = {
        backgroundColor: color = undefined; // Value is animatable
        opacity: number = 1.0; // Value is animatable
        overflow: 'hidden' | 'visible';

        borderWidth: number;
        borderTopWidth: number;
        borderRightWidth: number;
        borderBottomWidth: number;
        borderLeftWidth: number;
        borderColor: color;
        borderStyle: 'solid' | 'dotted' | 'dashed' | 'none';
        borderRadius: number;  // Sets all four border radius attributes; value is animatable
        borderTopRightRadius: number = 0;
        borderBottomRightRadius: number = 0;
        borderBottomLeftRadius: number = 0;
        borderTopLeftRadius: number = 0;

        // NOTE: If applied to a Text element, these properties translate to text shadows,
        // not a box shadow.
        shadowOffset: { height: number; width: number } = { 0, 0 };
        shadowRadius: number = 0;
        shadowColor: color = 'black';
        elevation: number; // Android only

        wordBreak: 'break-all' | 'break-word'; // Web only
        appRegion: 'drag' | 'no-drag'; // Web only
        cursor: 'pointer' | 'default'; // Web only
      }
    */
  }

  if (isText) {
    let color: string;
    if (component.fills.length > 0) {
      const {r, g, b} = component.fills[0].color;
      color = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
    }
    const fontSize = component.fontSize;
    const fontFamily = component.fontName.family;
    const isItalic = component.fontName.style.indexOf('Italic') !== -1;
    const isBold = component.fontName.style.indexOf('Bold') !== -1;
    const isThin = component.fontName.style.indexOf('Thin') !== -1;
    const isUnderline = component.textDecoration === 'UNDERLINE';
    const isCrossed = component.textDecoration === 'STRIKETHROUGH';
    const isAlignLeft = component.textAlignHorizontal === 'LEFT';
    const isAlignRight = component.textAlignHorizontal === 'RIGHT';
    const isAlignTop = component.textAlignVertical === 'TOP';
    const isAlignBottom = component.textAlignVertical === 'BOTTOM';
  
    styles = {
      ...styles,
      color,
      fontSize,
      // fontFamily,
      letterSpacing: undefined, // TODO
      lineHeight: undefined, // TODO
      fontStyle: isItalic ? 'italic' : undefined,
      fontWeight: isBold ? '700' : isThin ? '300' : undefined,
      textAlign: isAlignLeft ? 'left' : isAlignRight ? 'right' : undefined,
      // textAlignVertical: isAlignTop ? 'top' : isAlignBottom ? 'bottom' : undefined,
      textDecorationLine: isUnderline ? 'underline' : isCrossed ? 'line-through' : undefined,
    };
  }

  return styles;
}

function getContent(children, depth = 0, deps = [], styles = {}) {
  let code = [];

  children.reverse().forEach(child => {
    const isText = child.type === 'TEXT';
    const isGroup = child.type === 'GROUP';
    const slug = getSlug(child.name);
    const tag = getTag(child.type);

    styles[slug] = {tag, style: getStyle(child)};
  
    if (isText && deps.indexOf('Text') === -1) {
      deps.push('Text');
    }

    if (isText) {
      code.push({slug, tag: 'Text', value: child.characters || ''});
    }

    if (isGroup) {
      const content = getContent([...child.children], depth + 1, deps, styles);
      styles = {...styles, ...content.styles};
      code.push({slug, tag: 'View', children: content.code});
    }
  });

  return {code, deps, styles};
}

function getTag(type: string) {
  switch (type) {
    case 'COMPONENT':
    case 'GROUP':
      return 'View';
    case 'TEXT':
      return 'Text';
    case 'IMAGE':
      return 'Image';
    default:
      return 'Unknown';
  }
}

function getName(value: string) {
  return value.replace(/\s/g, '');
}

function getSlug(value: string) {
  return value.split(' ').map((word, index) => {
    if (index == 0) return word.toLowerCase();
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join('');
}
