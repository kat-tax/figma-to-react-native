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
  return augmentStyles(styles);
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

// TODO: convert var references to theme values
function getTokenFromVar(str: string): string | null {
  const regex = /^var\(\-\-([^),\s]+).*?\)/;
  const match = str.match(regex);
  if (match) {
    const [, name] = match;
    const full = name.replace('-', '.');
    const parts = full.split('.');
    const prefix = parts.shift();
    const suffix = parts.pop().replace(/-/g, '_');
    return `${prefix}.$${suffix}`;
  }
  return null;
}
