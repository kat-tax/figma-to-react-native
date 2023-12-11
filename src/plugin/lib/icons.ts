const svgProps = `xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"`;

export function importSet(prefix: string, icons: Record<string, string>) {
  console.log('[generateIcons]', prefix, icons);

  // Create page
  let page = figma.root.children.find(p => p.name === 'Icons');
  if (!page) {
    page = figma.createPage();
    page.name = 'Icons';
    figma.root.appendChild(page);
  }
  
  // Create frame
  const frame = figma.createFrame();
  frame.name = prefix;

  // Create icons
  Object.entries(icons).forEach(([name, svg]) => {
    const icon = figma.createNodeFromSvg(`<svg ${svgProps}>${svg}</svg>`);
    icon.name = name;
    icon.resize(24, 24);
    const component = figma.createComponent();
    component.name = name;
    component.appendChild(icon);
    frame.appendChild(component);
  });

  // Add frame to page
  page.appendChild(frame);
}
