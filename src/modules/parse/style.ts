export function parseStyles(component: any) {
  // Component types
  const isText = component.type === 'TEXT';
  const isGroup = component.type === 'GROUP';
  const isComponent = component.type === 'COMPONENT';

  // Stylesheet
  let styles = {};

  // Group specific styles
  if (isComponent || isGroup) {

    // Background color
    let backgroundColor: string;
    if (component.backgrounds.length > 0) {
      const {r, g, b} = component.backgrounds[0].color;
      backgroundColor = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
    }

    // Absolute positioning
    const {height, width} = component;

    // Flexbox positioning
    let flexbox: any = {};
    if (component.layoutPositioning === 'AUTO') {
      flexbox.display = 'flex';
      flexbox.position = 'relative';
      flexbox.flexDirection = component.layoutMode === 'VERTICAL' ? 'column' : 'row';
      // TODO: better align
      flexbox.alignItems = component.layoutAlign === 'CENTER' || component.layoutAlign === 'INHERIT'
        ? 'center'
        : 'flex-start';
      flexbox.justifyContent = component.layoutAlign === 'INHERIT'
        ? 'center'
        : '';
      if (component.itemSpacing) {
        flexbox.gap = component.itemSpacing;
      }
    }

    // Padding
    let padding: any = {};
    if (component.paddingTop !== component.paddingBottom) {
      if (component.paddingTop !== 0)
        padding.paddingTop = component.paddingTop;
      if (component.paddingBottom !== 0)
        padding.paddingBottom = component.paddingBottom;
    } else if (component.paddingTop !== 0) {
      padding.paddingVertical = component.paddingTop;
    }
    if (component.paddingLeft !== component.paddingRight) {
      if (component.paddingLeft !== 0)
        padding.paddingLeft = component.paddingLeft;
      if (component.paddingRight !== 0)
        padding.paddingRight = component.paddingRight;
    } else if (component.paddingLeft !== 0) {
      padding.paddingHorizontal = component.paddingLeft;
    }

    styles = {
      width,
      height,
      ...styles,
      ...flexbox,
      ...padding,
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

  // Text specific styles
  if (isText) {
    let color: string;
    if (component.fills.length > 0) {
      const {r, g, b} = component.fills[0].color;
      color = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
    }
    const fontSize = component.fontSize;
    const fontFamily = component.fontName.family;
    const isItalic = component.fontName.style.includes('Italic');
    const isBold = component.fontName.style.includes('Bold');
    const isThin = component.fontName.style.includes('Thin');
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

  // Return stylesheet
  return styles;
}
