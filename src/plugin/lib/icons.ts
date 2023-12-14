// TODO: assign "background" to frame and "foreground" colors to icons

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

  // Create styles
  const {background, foreground} = createTheme();
  
  // Create set frame
  const frame = figma.createFrame();
  frame.name = `${setName}, Normal, ${svgSize}`;
  frame.fillStyleId = background?.id;
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

  // Add frame to page
  page.appendChild(frame);

  // Focus frame
  focusNode(frame.id);

  // Create icons
  await createIcons(frame, icons, foreground);
}

export async function createIcons(
  root: FrameNode,
  icons: Record<string, string>,
  fill: PaintStyle,
) {
  const batch = 5;
  const delay = 5;
  let i = 0;

  for await (const [name, svg] of Object.entries(icons)) {
    if (i++ % batch === 0)
      await wait(delay);

    // Create icon frame
    const frame = figma.createNodeFromSvg(`<svg ${svgProps}>${svg}</svg>`);
    frame.name = 'Frame';
  
    // Create icon component
    const component = figma.createComponent();
    component.name = name;
    component.layoutMode = 'VERTICAL';
    component.layoutPositioning = 'AUTO';
    component.primaryAxisAlignItems = 'CENTER';
    component.counterAxisAlignItems = 'CENTER';
    component.layoutSizingVertical = 'FIXED';
    component.layoutSizingHorizontal = 'FIXED';

    // Add fill to all children
    frame.findAllWithCriteria({types: ['VECTOR']}).forEach(c => {
      console.log(c, fill);;
      c.fillStyleId = fill?.id;
    });

    // Resize icon component, add to component, and ungroup
    component.resize(svgSize, svgSize);
    component.appendChild(frame);
    figma.ungroup(frame);

    // Add component to root
    root.appendChild(component);
  }
}

export function createTheme() {
  return createLocalStylesTheme();
}

export function createLocalStylesTheme() {
  const background = figma.createPaintStyle();
  background.name = 'background';
  background.paints = [{type: 'SOLID', color: {r: 0, g: 0, b: 0}}];
  const foreground = figma.createPaintStyle();
  foreground.name = 'foreground';
  foreground.paints = [{type: 'SOLID', color: {r: 1, g: 1, b: 1}}];
  return {background, foreground};
}

export function createVariableTheme() {
  const theme = figma.variables.createVariableCollection('Theme');
  //figma.createVariable({name: 'background', type: 'color', value: {r: 0, g: 0, b: 0}, collection: theme});
  theme.addMode('Light');
  theme.addMode('Dark');
}

export function getAllIconComponents() {
  const iconPage = figma.root?.children?.find(p => p.name === 'Icons');
  const components = iconPage?.findAllWithCriteria({types: ['COMPONENT']});
  const icons = components?.filter(c => c.name.includes(':'));
  return icons;
}
