import {focusNode, getVariables, getVariableCollection} from 'backend/parser/lib';
import {PAGES_SPECIAL, VARIABLE_COLLECTIONS} from 'config/consts';
import {titleCase} from 'common/string';
import {wait} from 'common/delay';

import type {IconifySetPayload, IconifySetData} from 'interface/icons/lib/iconify';

const COLOR_BACKGROUND = 'Background';
const COLOR_FOREGROUND = 'Foreground';
const SVG_MODE = 'Normal';
const SVG_SIZE = 32;
const SVG_PROPS = (size: number) =>
  `xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" role="img" width="${size}" height="${size}" viewBox="0 0 256 256"`;

export async function importIcons(sets: IconifySetPayload) {
  for (const [prefix, set] of Object.entries(sets)) {
    await createIconSet(prefix, set);
  }
}

export async function createIconSet(prefix: string, set: IconifySetData) {
  // Number of icon columns
  const columns = 15;
  const name = set.name;
  const size = set.size || SVG_SIZE;
  const mode = set.mode || SVG_MODE;

  // Create page
  let page = figma.root.children.find(p =>
    p.name === PAGES_SPECIAL.ICONS);
  if (!page) {
    page = figma.createPage();
    page.name = PAGES_SPECIAL.ICONS;
    figma.root.appendChild(page);
  } else {
    // Page exists
    // TODO: find starting x,y from existing section
  }

  // Get theme
  const theme = await getThemeTokens();
  if (!theme.background || !theme.foreground) {
    return;
  }

  // Create icon set frame
  const frame = figma.createFrame();
  frame.name = `${name}, ${mode}, ${size}`;
  frame.cornerRadius = 3;
  frame.itemSpacing = 5;
  frame.counterAxisSpacing = 5;
  frame.verticalPadding = 10;
  frame.horizontalPadding = 10;
  frame.layoutMode = 'HORIZONTAL';
  frame.layoutWrap = 'WRAP';
  frame.layoutPositioning = 'AUTO';
  frame.layoutSizingVertical = 'HUG';
  frame.layoutSizingHorizontal = 'FIXED';
  frame.resize((columns * size)
    + ((columns - 1) * frame.itemSpacing)
    + frame.horizontalPadding * 2
  , 100);

  // Set frame background
  if (theme.isVariable) {
    const fills = frame.fills !== figma.mixed ? {...frame.fills} : {};
    fills[0] = figma.variables.setBoundVariableForPaint(fills[0], 'color', theme.background);
    frame.fills = [fills[0]];
  } else {
    frame.fillStyleId = theme.background?.id;
  }

  // Add frame to page
  page.appendChild(frame);

  // Focus frame
  figma.notify(`Importing ${titleCase(name)} Icons...`, {
    timeout: 3000,
    button: {
      text: 'View',
      action: () => {focusNode(frame.id)},
    }
  });

  // Get icon style & variable
  let style: PaintStyle;
  let variable: Variable;
  if (theme.isVariable) {
    variable = theme.foreground;
  } else if (theme.isVariable === false) {
    style = theme.foreground;
  }

  // Create icons
  await createIcons(prefix, set.list, frame, size, style, variable);
}

export async function createIcons(
  prefix: string,
  icons: Record<string, string>,
  root: FrameNode,
  size: number,
  style?: PaintStyle,
  variable?: Variable,
) {
  const batch = 5;
  const ms = 5;
  let i = 0;

  for (const [name, svg] of Object.entries(icons)) {
    if (i++ % batch === 0)
      await wait(ms);

    // Create icon component
    const component = figma.createComponent();
    component.name = `${prefix}:${name}`;
    component.lockAspectRatio();
    component.resize(size, size);

    // Create icon frame
    const frame = figma.createNodeFromSvg(`<svg ${SVG_PROPS(size)}>${svg}</svg>`);
    frame.name = 'Frame';
    frame.findAllWithCriteria({types: ['VECTOR']}).forEach(c => {
      if (style) {
        c.fillStyleId = style?.id;
      } else if (variable) {
        const fills = c.fills !== figma.mixed ? {...c.fills} : {};
        fills[0] = figma.variables.setBoundVariableForPaint(fills[0], 'color', variable);
        c.fills = [fills[0]];
      }
    });

    // Add component to root
    component.appendChild(frame);
    figma.ungroup(frame);
    root.appendChild(component);
  }
}

export async function getThemeTokens() {
  try {
    return await getVariableTokens();
  } catch (e) {
    return await getLocalStylesTokens();
  }
}

export async function getLocalStylesTokens(): Promise<{background: PaintStyle, foreground: PaintStyle, isVariable: false}> {
  const styles = await figma.getLocalPaintStylesAsync();
  const background = styles.find(s => s.name === COLOR_BACKGROUND);
  const foreground = styles.find(s => s.name === COLOR_FOREGROUND);
  return {background, foreground, isVariable: false};
}

export async function getVariableTokens(): Promise<{background: Variable, foreground: Variable, isVariable: true}> {
  let background: Variable;
  let foreground: Variable;
  const theme = await getVariableCollection(VARIABLE_COLLECTIONS.THEMES);
  if (theme) {
    const variables = await getVariables(theme.variableIds);
    for (const variable of variables) {
      if (variable.name === COLOR_BACKGROUND)
        background = variable;
      if (variable.name === COLOR_FOREGROUND)
        foreground = variable;
      if (background && foreground)
        break;
    }
  }
  return {background, foreground, isVariable: true};
}

export function getAllIconComponents() {
  const iconPage = figma.root?.children?.find(p => p.name === PAGES_SPECIAL.ICONS);
  const components = iconPage?.findAllWithCriteria({types: ['COMPONENT']});
  const icons = components?.filter(c => c.name.includes(':'));
  return icons;
}

export function getIconComponentMap() {
  const map: Record<string, string> = {};
  getAllIconComponents().forEach(icon => {
    map[icon.name] = icon.id;
  });
  return map;
}
