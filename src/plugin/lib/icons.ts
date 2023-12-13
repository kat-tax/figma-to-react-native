// TODO: assign "background" to frame and "foreground" colors to icons

import {wait} from 'common/delay';

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
  
  // Create set frame
  const frame = figma.createFrame();
  frame.name = `${setName}, Normal, ${svgSize}`;
  // frame.fills = [{type: 'SOLID', color: {r: 0, g: 0, b: 0}}];
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

  // Create icons
  await createIcons(frame, icons);
}

export async function createIcons(frame: FrameNode, icons: Record<string, string>) {
  const batch = 5;
  const delay = 5;
  let i = 0;

  for await (const [name, svg] of Object.entries(icons)) {
    if (i++ % batch === 0)
      await wait(delay);

    // Create icon frame
    const icon = figma.createNodeFromSvg(`<svg ${svgProps}>${svg}</svg>`);
    icon.name = 'Frame';
  
    // Create icon component
    const component = figma.createComponent();
    component.name = name;
    component.layoutMode = 'VERTICAL';
    component.layoutPositioning = 'AUTO';
    component.primaryAxisAlignItems = 'CENTER';
    component.counterAxisAlignItems = 'CENTER';
    component.layoutSizingVertical = 'FIXED';
    component.layoutSizingHorizontal = 'FIXED';

    // Resize icon frame, add to component, and ungroup
    component.resize(svgSize, svgSize);
    component.appendChild(icon);
    figma.ungroup(icon);

    // Add component to icons frame
    frame.appendChild(component);
  }
}
