import * as delay from 'common/delay';
import * as string from 'common/string';
import * as consts from 'config/consts';
import * as parser from 'backend/parser/lib';

const SVG_SIZE = 16;
const SVG_PROPS = `xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" role="img" width="${SVG_SIZE}" height="${SVG_SIZE}" viewBox="0 0 256 256"`;
const COLOR_BACKGROUND = 'Background';
const COLOR_FOREGROUND = 'Foreground';

export async function importIcons(setName: string, icons: Record<string, string>) {
  // Number of icon columns
  const columns = 15;

  // Create page
  let page = figma.root.children.find(p => p.name === consts.PAGES_SPECIAL.ICONS);
  if (!page) {
    page = figma.createPage();
    page.name = consts.PAGES_SPECIAL.ICONS;
    figma.root.appendChild(page);
  // Page exists, remove all children
  } else {
    page.children.forEach(c => c.remove());
  }

  // Get theme
  const theme = await getThemeTokens();
  if (!theme.background || !theme.foreground) {
    return;
  }
  
  // Create icon set frame
  const frame = figma.createFrame();
  frame.name = `${setName}, Normal, ${SVG_SIZE}`;
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
  frame.resize((columns * SVG_SIZE)
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
  figma.notify(`Importing ${string.titleCase(setName)} Icons...`, {
    timeout: 3000,
    button: {
      text: 'View',
      action: () => {
        parser.focusNode(frame.id)
      },
    }
  });

  // Get icon style / var
  let iconStyle: PaintStyle;
  let iconVariable: Variable;
  if (theme.isVariable) {
    iconVariable = theme.foreground
  } else if (theme.isVariable === false) {
    iconStyle = theme.foreground;
  }

  // Create icons
  await createIcons(frame, icons, iconStyle, iconVariable);
}

export async function createIcons(
  root: FrameNode,
  icons: Record<string, string>,
  style?: PaintStyle,
  variable?: Variable,
) {
  const batch = 5;
  const ms = 5;
  let i = 0;

  for await (const [name, svg] of Object.entries(icons)) {
    if (i++ % batch === 0)
      await delay.wait(ms);
  
    // Create icon component
    const component = figma.createComponent();
    component.name = name;
    component.layoutMode = 'VERTICAL';
    component.layoutPositioning = 'AUTO';
    component.primaryAxisAlignItems = 'CENTER';
    component.counterAxisAlignItems = 'CENTER';
    component.layoutSizingVertical = 'FIXED';
    component.layoutSizingHorizontal = 'FIXED';
    component.resize(SVG_SIZE, SVG_SIZE);

    // Create icon frame
    const frame = figma.createNodeFromSvg(`<svg ${SVG_PROPS}>${svg}</svg>`);
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

export async function getLocalStylesTokens(): Promise<{
  background: PaintStyle,
  foreground: PaintStyle,
  isVariable: false,
}> {
  const styles = await figma.getLocalPaintStylesAsync();
  const background = styles.find(s => s.name === COLOR_BACKGROUND);
  const foreground = styles.find(s => s.name === COLOR_FOREGROUND);
  return {background, foreground, isVariable: false};
}

export async function getVariableTokens(): Promise<{
  background: Variable,
  foreground: Variable,
  isVariable: true,
}> {
  let background: Variable;
  let foreground: Variable;
  const theme = await parser.getVariableCollection(consts.VARIABLE_COLLECTIONS.THEMES);
  if (theme) {
    const variables = await parser.getVariables(theme.variableIds);
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
  const iconPage = figma.root?.children?.find(p => p.name === consts.PAGES_SPECIAL.ICONS);
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
