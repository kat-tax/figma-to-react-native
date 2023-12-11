export function importSet(prefix: string, icons: Record<string, string>) {
  // Get / create icon page
  let page = figma.root.children.find(p => p.name === 'Icons');
  if (!page) {
    page = figma.createPage();
    page.name = 'Icons';
    figma.root.appendChild(page);
  }

  Object.values(icons).forEach(([name, svg]) => {
    // Create icon
    const icon = figma.createNodeFromSvg(svg);
    icon.name = name;
    icon.resize(24, 24);

    // Add to component
    const component = figma.createComponent();
    component.name = name;
    component.appendChild(icon);

    // Add to page
    page.appendChild(component);
  });

  console.log('[generateIcons]', prefix);
}
