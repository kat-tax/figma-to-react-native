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
  // Return mutated styles
  return styles;
}

// TODO: convert var references to theme values
function getParameters(str: string): [string, string] | null {
  const regex = /^var\((--\w+),\s*(.+)\)$/i;
  const match = str.match(regex);
  if (match) {
    const [, name, value] = match;
    return [name, value];
  }
  return null;
}
