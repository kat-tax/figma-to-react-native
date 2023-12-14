import {wait} from 'common/delay';
import {focusNode} from 'plugin/fig/lib';

const svgSize = 16;
const svgProps = `xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" role="img" width="${svgSize}" height="${svgSize}" viewBox="0 0 256 256"`;

export async function importSet(setName: string, icons: Record<string, string>) {
  // Number of icon columns
  const columns = 15;

  // Create page
  let page = figma.root.children.find(p => p.name === 'Icons');
  if (!page) {
    page = figma.createPage();
    page.name = 'Icons';
    figma.root.appendChild(page);
  // Page exists, remove all children
  } else {
    page.children.forEach(c => c.remove());
  }

  // Create theme (or use existing)
  const theme = createTheme();
  
  // Create icon set frame
  const frame = figma.createFrame();
  frame.name = `${setName}, Normal, ${svgSize}`;
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
  frame.resize((columns * svgSize)
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
  focusNode(frame.id);

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
  const delay = 5;
  let i = 0;

  for await (const [name, svg] of Object.entries(icons)) {
    if (i++ % batch === 0)
      await wait(delay);
  
    // Create icon component
    const component = figma.createComponent();
    component.name = name;
    component.layoutMode = 'VERTICAL';
    component.layoutPositioning = 'AUTO';
    component.primaryAxisAlignItems = 'CENTER';
    component.counterAxisAlignItems = 'CENTER';
    component.layoutSizingVertical = 'FIXED';
    component.layoutSizingHorizontal = 'FIXED';
    component.resize(svgSize, svgSize);

    // Create icon frame
    const frame = figma.createNodeFromSvg(`<svg ${svgProps}>${svg}</svg>`);
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

export function createTheme() {
  try {
    return createVariableTheme();
  } catch (e) {
    return createLocalStylesTheme();
  }
}

export function createLocalStylesTheme(): {
  background: PaintStyle,
  foreground: PaintStyle,
  isVariable: false,
} {
  const styles = figma.getLocalPaintStyles();
  let background = styles.find(s => s.name === 'background');
  let foreground = styles.find(s => s.name === 'foreground');
  if (!background) {    
    background = figma.createPaintStyle();
    background.name = 'background';
    background.paints = [{type: 'SOLID', color: {r: 0, g: 0, b: 0}}];
  }
  if (!foreground) {    
    foreground = figma.createPaintStyle();
    foreground.name = 'foreground';
    foreground.paints = [{type: 'SOLID', color: {r: 1, g: 1, b: 1}}];
  }
  return {background, foreground, isVariable: false};
}

export function createVariableTheme(): {
  background: Variable,
  foreground: Variable,
  isVariable: true,
} {
  let theme: VariableCollection;
  let background: Variable;
  let foreground: Variable;
  let createdBackground = false;
  let createdForeground = false;

  // Try to find existing collection
  theme = figma.variables.getLocalVariableCollections()
    ?.find(c => c.name === 'Theme');

  // Try to create collection if does not exist
  // this will be a Figma pay-walled feature after public beta
  if (!theme) {
    try {
      theme = figma.variables.createVariableCollection('Theme');
    } catch (e) {
      throw new Error(e);
    }
  // Collection exists, find variables
  } else {
    const variables = theme.variableIds.map(id => figma.variables.getVariableById(id))
    for (const variable of variables) {
      if (variable.name === 'background')
        background = variable;
      if (variable.name === 'foreground')
        foreground = variable;
      if (background && foreground)
        break;
    }
  }

  // Try to add dark mode
  // this is currently a Figma pay-walled feature
  try {
    theme.addMode('Dark');
    theme.renameMode(theme.defaultModeId, 'Light');
  } catch (e) {
    console.log('Could not add dark mode', e);
  }

  // Background variable does not exist, create it
  if (!background) {
    try {
      background = figma.variables.createVariable('background', theme.id, 'COLOR');
      createdBackground = true;
    } catch (e) {
      throw new Error(e);
    }
  }

  // Foreground variable does not exist, create it
  if (!foreground) {
    try {
      foreground = figma.variables.createVariable('foreground', theme.id, 'COLOR');
      createdForeground = true;
    } catch (e) {
      throw new Error(e);
    }
  }

  // If created any variables, set colors for all modes
  if (createdBackground || createdForeground) {
    const black: RGB = {r: 0, g: 0, b: 0};
    const white: RGB = {r: 1, g: 1, b: 1};
    theme.modes.forEach(({modeId}) => {
      const isDefault = modeId === theme.defaultModeId;
      createdBackground && background.setValueForMode(modeId, isDefault ? white : black);
      createdForeground && foreground.setValueForMode(modeId, isDefault ? black : white);
    });
  }

  return {background, foreground, isVariable: true};
}

export function getAllIconComponents() {
  const iconPage = figma.root?.children?.find(p => p.name === 'Icons');
  const components = iconPage?.findAllWithCriteria({types: ['COMPONENT']});
  const icons = components?.filter(c => c.name.includes(':'));
  return icons;
}
