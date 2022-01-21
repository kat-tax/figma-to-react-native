export function getContent(
  children,
  depth = 0,
  deps = [],
  styles = {},
) {
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
      code.push({slug, tag: 'XStack', children: content.code});
    }
  });

  return {code, deps, styles};
}

export function getStyle(component: SceneNode) {
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

export function getTag(type: string) {
  switch (type) {
    case 'COMPONENT':
    case 'GROUP':
      return 'XStack';
    case 'TEXT':
      return 'Text';
    case 'IMAGE':
      return 'Image';
    default:
      return 'Unknown';
  }
}

export function getName(value: string) {
  return value.replace(/\s/g, '');
}

export function getSlug(value: string) {
  return value.split(' ').map((word, index) => {
    if (index == 0) return word.toLowerCase();
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join('');
}
