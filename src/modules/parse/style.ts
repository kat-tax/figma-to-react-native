import {colorToCSS, getSlug} from 'utils/figma';

export function parseStyles(component: any) {
  // Component types
  const isText = component.type === 'TEXT';
  const isGroup = component.type === 'GROUP';
  const isComponent = component.type === 'COMPONENT';

  const fillStyle = figma.getStyleById(component.fillStyleId);
  let fillKey: string;
  if (fillStyle?.name) {
    const [fillGroup, fillToken] = fillStyle.name.split('/');
    fillKey = `colors.${getSlug(fillGroup)}.${getSlug(fillToken)}`;
  }

  // Stylesheet
  let styles = {};

  // Group specific styles
  if (isComponent || isGroup) {

    // Background color
    let backgroundColor: string;
    if (component.backgrounds.length > 0) {
      backgroundColor = fillKey ?? colorToCSS(component.backgrounds[0].color);
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
      color = fillKey ?? colorToCSS(component.fills[0].color);
    }

    const fontSize = component.fontSize;
    const fontFamily = component.fontFamily;
    const fontWeight = getStyleFontWeight(component.fontName.style);
    const isItalic = component.fontName.style.match(/italic/i);
    const isUnderline = component.textDecoration === 'UNDERLINE';
    const isCrossed = component.textDecoration === 'STRIKETHROUGH';
    const isAlignLeft = component.textAlignHorizontal === 'LEFT';
    const isAlignRight = component.textAlignHorizontal === 'RIGHT';
    const isAlignBottom = component.textAlignVertical === 'BOTTOM';
    const isAlignTop = component.textAlignVertical === 'TOP';
  
    styles = {
      ...styles,
      color,
      fontSize,
      fontWeight,
      fontFamily,
      fontStyle: isItalic ? 'italic' : undefined,
      textAlign: isAlignLeft ? 'left' : isAlignRight ? 'right' : undefined,
      textDecorationLine: isUnderline ? 'underline' : isCrossed ? 'line-through' : undefined,
      textAlignVertical: isAlignTop ? 'top' : isAlignBottom ? 'bottom' : undefined,
      letterSpacing: undefined, // TODO
      lineHeight: undefined, // TODO
    };
  }

  // Return stylesheet
  return styles;
}

function getStyleLayout() {
  // ...
}

function getStyleOpacity() {
  // ...
}

function getStyleEffects() {
  // ...
}

function getStyleFontWeight(style: string): number {
  switch (style.replace(/\s*italic\s*/i, '')) {
    case 'Thin':
      return 100;
    case 'Extra Light':
    case 'Extra-light':
      return 200;
    case 'Light':
      return 300;
    case 'Regular':
      return 400;
    case 'Medium':
      return 500;
    case 'Semi Bold':
    case 'Semi-bold':
      return 600;
    case 'Bold':
      return 700;
    case 'Extra Bold':
    case 'Extra-bold':
      return 800;
    case 'Black':
      return 900;
  }
  return 400;
}
