import {emit} from '@create-figma-plugin/utilities';
import {focusNode, getVariables, getVariableCollection} from 'backend/parser/lib';
import {PAGES_SPECIAL, VARIABLE_COLLECTIONS, F2RN_ICONS_SET_DATA} from 'config/consts';
import {titleCase} from 'common/string';
import {wait} from 'common/delay';

import type {IconifySetPayload, IconifySetData} from 'interface/icons/lib/iconify';
import type {EventProjectUpdateIconsDone} from 'types/events';

const DEFAULT_COLOR_BACKGROUND = 'Background';
const DEFAULT_COLOR_FOREGROUND = 'Foreground';
const DEFAULT_SVG_PROPS = (width: number = 256, height: number = 256) =>
  `xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" role="img" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"`;

export async function importIcons(sets: IconifySetPayload) {
  for (const [prefix, set] of Object.entries(sets)) {
    await createIconSet(prefix, set);
  }
}

export async function updateIcons(prefix: string, set: IconifySetData) {
  // Find icon set frame
  const frame = (await getIconSetFrames(prefix))?.[0];
  // Check if frame exists
  if (!frame?.id) {
    figma.notify(`Icon set ${set.name} not found`, {
      timeout: 3000,
      error: true,
    });
    return;
  }
  // Get theme
  const theme = await getThemeTokens();
  if (!theme.background || !theme.foreground) {
    return;
  }
  // Get icon style & variable
  let style: PaintStyle;
  let variable: Variable;
  if (theme.isVariable) {
    variable = theme.foreground;
  } else if (theme.isVariable === false) {
    style = theme.foreground;
  }
  // Get existing icon names from frame
  const iconsExisting = frame.children.map(c => c.name.split(':')[1]);
  // Find icons that exist in set.list but not in frame
  const iconsMissing = Object.keys(set.list).filter(iconName => !iconsExisting.includes(iconName));
  // Convert array to object with icon data
  const icons = iconsMissing.reduce((acc, name) => {
    acc[name] = set.list[name];
    return acc;
  }, {} as IconifySetData['list']);
  // Create icons if there are any
  if (Object.keys(icons).length) {
    // User feedback
    figma.notify(`Updating ${titleCase(set.name)}...`, {
      timeout: 3000,
      button: {
        text: 'View',
        action: () => {focusNode(frame.id)},
      }
    });
    await createIcons(
      prefix,
      icons,
      set.view ?? 256,
      frame,
      set.fill ?? true,
      style,
      variable,
    );
    const msg = `${titleCase(set.name)} updated (${iconsMissing.length} icon${iconsMissing.length === 1 ? '' : 's'} added)`;
    figma.notify(msg, {timeout: 3000});
  } else {
    figma.notify(`${titleCase(set.name)} is up to date`, {timeout: 3000});
  }
  // Notify interface that update is done
  emit<EventProjectUpdateIconsDone>('PROJECT_UPDATE_ICONS_DONE', prefix);
}

export async function createIconSet(prefix: string, set: IconifySetData) {
  // Get theme
  const theme = await getThemeTokens();
  if (!theme.background || !theme.foreground) {
    return;
  }

  // Create / get icon page
  const page = await createIconPage();

  // Get existing icon set frames (if any)
  const frames = await getIconSetFrames();

  // Get the farthest right frame
  const offsetX = frames.reduce((max, frame) =>
    Math.max(max, frame.x + frame.width),
    0,
  );

  // Create icon set frame
  const varies = hasVaryingIconSize(set.list);
  const frame = figma.createFrame();
  const cols = 15;
  const name = set.name;
  const size = varies ? 0 : set.size ?? 32;
  const view = set.view ?? 256;
  const mode = set.mode ?? 'Normal';
  const fill = set.fill ?? true;
  const time = Date.now();

  frame.x = offsetX + 50;
  frame.name = `${name}, ${mode}, ${varies ? `Varies` : size}`;
  frame.cornerRadius = 3;
  frame.itemSpacing = varies ? 10 : 5;
  frame.counterAxisSpacing = 5;
  frame.verticalPadding = 10;
  frame.horizontalPadding = 10;

  // If size varies, should be list
  if (varies) {
    frame.layoutMode = 'VERTICAL';
    frame.layoutWrap = 'NO_WRAP';
    frame.layoutPositioning = 'AUTO';
    frame.layoutSizingVertical = 'HUG';
    frame.layoutSizingHorizontal = 'HUG';
  // Otherwise, should be a grid
  } else {
    frame.layoutMode = 'HORIZONTAL';
    frame.layoutWrap = 'WRAP';
    frame.layoutPositioning = 'AUTO';
    frame.layoutSizingVertical = 'HUG';
    frame.layoutSizingHorizontal = 'FIXED';
    frame.resize((cols * view)
      + ((cols - 1) * frame.itemSpacing)
      + frame.horizontalPadding * 2
    , 100);
  }

  // Set frame data
  frame.setPluginData(F2RN_ICONS_SET_DATA, JSON.stringify({
    prefix,
    name,
    mode,
    size,
    fill,
    time,
  }));

  // Set frame background
  if (theme.isVariable) {
    const fills = frame.fills !== figma.mixed ? {...frame.fills} : {};
    fills[0] = figma.variables.setBoundVariableForPaint(fills[0], 'color', theme.background);
    frame.fills = [fills[0]];
  } else {
    frame.fillStyleId = theme.background?.id;
  }

  // Add frame to page
  // Note: delays needed to prevent adding to wrong page
  await wait(500);
  page.appendChild(frame);
  await wait(1000);

  // User feedback
  figma.notify(`Importing ${titleCase(name)}...`, {
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
  await createIcons(
    prefix,
    set.list,
    view,
    frame,
    fill,
    style,
    variable,
  );
}

export async function createIcons(
  prefix: string,
  list: IconifySetData['list'],
  sizeSVG: number,
  root: FrameNode,
  fill: boolean,
  style?: PaintStyle,
  variable?: Variable,
) {
  const batch = 5;
  const ms = 5;
  let i = 0;

  // Create icon components for all in set
  for (const [name, icon] of Object.entries(list)) {
    if (i++ % batch === 0)
      await wait(ms);

    // Get icon dimensions
    const width = icon.width ?? sizeSVG;
    const height = icon.height ?? sizeSVG;

    // Create icon component
    const component = figma.createComponent();
    component.name = `${prefix}:${name}`;
    component.lockAspectRatio();
    component.resize(width, height);

    // Create icon frame
    const frame = figma.createNodeFromSvg(`<svg ${DEFAULT_SVG_PROPS(width, height)}>${icon.body}</svg>`);
    frame.name = 'Frame';

    // Replace colors with theme variables
    // if fill is true, there is no pallete (emojis, flags, colored icons, etc.)
    if (fill) {
      frame.findAllWithCriteria({types: ['VECTOR']}).forEach(c => {
        // Check if fill or stroke has a color, if so we will replace w/ style or variable
        const hasColorFill = c.fills !== figma.mixed && c.fills?.some(f => f.type === 'SOLID');
        const hasColorStroke = c.strokes?.some(s => s.type === 'SOLID');
        // Color styles (pre-variable system)
        if (style) {
          if (hasColorFill) c.fillStyleId = style?.id;
          if (hasColorStroke) c.strokeStyleId = style?.id;
        // Variable colors (most likely used)
        } else if (variable) {
          if (hasColorFill) {
            const fills = c.fills !== figma.mixed ? {...c.fills} : {};
            fills[0] = figma.variables.setBoundVariableForPaint(fills[0], 'color', variable);
            c.fills = [fills[0]];
          }
          if (hasColorStroke) {
            const strokes = c.strokes ? [...c.strokes] : {};
            strokes[0] = figma.variables.setBoundVariableForPaint(strokes[0], 'color', variable);
            c.strokes = [strokes[0]];
          }
        }
      });
    }

    // Add component to root
    component.appendChild(frame);
    figma.ungroup(frame);
    root.appendChild(component);
  }
}

export async function createIconPage() {
  let page = figma.root.children.find(p =>
    p.name === PAGES_SPECIAL.ICONS);
  if (!page) {
    page = figma.createPage();
    page.name = PAGES_SPECIAL.ICONS;
    figma.root.appendChild(page);
  }
  return page;
}

export async function getIconSetFrames(prefix?: string) {
  const frames = figma.root.findAllWithCriteria({types: ['FRAME'], pluginData: {keys: [F2RN_ICONS_SET_DATA]}});
  if (prefix) {
    for (const frame of frames) {
      try {
        const data = frame.getPluginData(F2RN_ICONS_SET_DATA);
        if (data) {
          const {prefix: framePrefix} = JSON.parse(data);
          if (framePrefix === prefix) {
            return [frame] as (FrameNode & {type: 'FRAME'})[];
          }
        }
      } catch (e) {}
    }
    return [];
  }
  return frames;
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
  const background = styles.find(s => s.name === DEFAULT_COLOR_BACKGROUND);
  const foreground = styles.find(s => s.name === DEFAULT_COLOR_FOREGROUND);
  return {background, foreground, isVariable: false};
}

export async function getVariableTokens(): Promise<{background: Variable, foreground: Variable, isVariable: true}> {
  let background: Variable;
  let foreground: Variable;
  const theme = await getVariableCollection(VARIABLE_COLLECTIONS.THEMES);
  if (theme) {
    const variables = await getVariables(theme.variableIds);
    for (const variable of variables) {
      if (variable.name === DEFAULT_COLOR_BACKGROUND)
        background = variable;
      if (variable.name === DEFAULT_COLOR_FOREGROUND)
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

function hasVaryingIconSize(list: IconifySetData['list']): boolean {
  // Loop through all icons
  for (const a of Object.values(list)) {
    let sizePresent = false;
    // Check against all other icons
    for (const b of Object.values(list)) {
      // We found an icon with dimensions
      if (b.height || b.width) {
        sizePresent = true;
        // We found a pair of icons with different sizes
        // Size doesn't matter at this point, return set size
        if (a.width !== b.width || a.height !== b.height) {
          return true;
        }
      }
    }
    // We looped through all icons and found no dimensions
    // so we can assume all icons have the same size, use set size
    if (!sizePresent) {
      return false;
    }
  }
  // Hopefully we didn't have to get to this point
  return false;
}
