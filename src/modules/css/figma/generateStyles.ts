import {getPropertyName, getStylesForProperty} from 'vendor/css-to-rn';
import type {NodeStyles} from 'types/figma';

export async function generateStyles(node: SceneNode): Promise<NodeStyles> {
  const css = await node.getCSSAsync();
  const styles = convertCSS(css);
  return styles;
}

function convertCSS(css: {[key: string]: string}): NodeStyles {
  let styles: NodeStyles = {};
  for (const [k, v] of Object.entries(css)) {
    const prop = getPropertyName(k);
    const value = v.trim();
    let convert: any;
    try {convert = getStylesForProperty(prop, value, true)} catch (err) {}
    if (convert) styles = {...styles, ...convert};
  }
  return shortHandStyles(augmentStyles(styles));
}

function augmentStyles(styles: NodeStyles): NodeStyles {
  // Set default flex direction explicitly for flex containers
  if (styles.display && !styles.flexDirection)
    styles.flexDirection = 'row';
  // Remove display property since flex is default
  if (styles.display === 'flex')
    delete styles.display;
  // Convert vars to theme values
  for (const [k, v] of Object.entries(styles)) {
    if (typeof v !== 'string') continue;
    const token = getTokenFromVar(v);
    if (token) {
      styles[k] = `theme.colors.${token}`;
    }
  }
  // Return mutated styles
  return styles;
}

function getTokenFromVar(str: string): string | null {
  const regex = /^var\(\-\-([^),\s]+).*?\)/;
  const match = str.match(regex);
  if (match) {
    const [, name] = match;
    if (name) {
      const full = name.replace('-', '.');
      const parts = full.split('.');
      const prefix = parts.shift();
      const suffix = parts.pop()?.replace(/-/g, '_');
      return suffix ? `${prefix}.$${suffix}` : prefix;
    }
  }
  return null;
}

function shortHandStyles(styles: NodeStyles): NodeStyles {
  // Padding
  if (styles.paddingLeft !== undefined
    && styles.paddingLeft === styles.paddingTop
    && styles.paddingLeft === styles.paddingRight
    && styles.paddingLeft === styles.paddingBottom) {
    styles.padding = styles.paddingLeft;
    delete styles.paddingTop;
    delete styles.paddingLeft;
    delete styles.paddingRight;
    delete styles.paddingBottom;
  } else {
    if (styles.paddingTop !== undefined
      && styles.paddingTop === styles.paddingBottom) {
      styles.paddingVertical = styles.paddingTop;
      delete styles.paddingTop;
      delete styles.paddingBottom;
    }
    if (styles.paddingLeft !== undefined
      && styles.paddingLeft === styles.paddingRight) {
      styles.paddingHorizontal = styles.paddingLeft;
      delete styles.paddingLeft;
      delete styles.paddingRight;
    }
  }
  // Margin
  if (styles.marginLeft !== undefined
    && styles.marginLeft === styles.marginTop
    && styles.marginLeft === styles.marginRight
    && styles.marginLeft === styles.marginBottom) {
    styles.margin = styles.marginLeft;
    delete styles.marginTop;
    delete styles.marginLeft;
    delete styles.marginRight;
    delete styles.marginBottom;
  } else {
    if (styles.marginTop !== undefined
      && styles.marginTop === styles.marginBottom) {
      styles.marginVertical = styles.marginTop;
      delete styles.marginTop;
      delete styles.marginBottom;
    }
    if (styles.marginLeft !== undefined
      && styles.marginLeft === styles.marginRight) {
      styles.marginHorizontal = styles.marginLeft;
      delete styles.marginLeft;
      delete styles.marginRight;
    }
    // Border radius
    if (styles.borderTopLeftRadius !== undefined
      && styles.borderTopLeftRadius === styles.borderTopRightRadius
      && styles.borderTopLeftRadius === styles.borderBottomLeftRadius
      && styles.borderTopLeftRadius === styles.borderBottomRightRadius) {
      styles.borderRadius = styles.borderTopLeftRadius;
      delete styles.borderTopLeftRadius;
      delete styles.borderTopRightRadius;
      delete styles.borderBottomLeftRadius;
      delete styles.borderBottomRightRadius;
    }
  }
  return styles;
}
