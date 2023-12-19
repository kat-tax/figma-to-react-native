import {wait} from 'common/delay';
import {focusNode, isNodeIcon} from 'plugin/fig/lib';
import {getIconComponentMap} from 'plugin/lib/icons';

type ExoComponents = Record<string, {
  list: Record<string, [string, boolean, number, number]>,
  rect: {x: number, y: number, width: number, height: number}, 
}>

export const EXO_COMPONENTS: ExoComponents = {
  Controls: {
    rect: {x: -2110, y: -783, width: 745, height: 414},
    list: {
      Button: ['e4b4b352052ba71c847b20b49d9e88a0093d4449', true, 100, 100],
    },
  },
  Popovers: {
    rect: {x: -1325, y: -783, width: 562, height:670},
    list: {
      Prompt: ['9261d5fed575a841eefc0de81b039814ef81b3ae', false, 100, 100],
      HoverCard: ['172abba0061738f4b1c69e85ef956603b4cdd5c4', false, 100, 400],
    },
  },
  Layout: {
    rect: {x: -723, y: -783, width:558, height: 400},
    list: {
      Placeholder: ['5863ef713ca50d36c7f32f8d1f33335d7f9eb552', false, 100, 100],
    },
  },
};

export const EXO_PRIMITIVES: ExoComponents = {
  Controls: {
    rect: {x: -2460, y: -777, width: 673, height: 624},
    list: {
      Slider: ['35f02e59aa82623edd3e65a47ae53d0d8c93b190', false, 100, 100],
    },
  },
};


export async function importComponents(iconSet: string) {
  // Create "Common" page
  let common = figma.root.children.find(p => p.name === 'Common');
  if (!common) {
    common = figma.createPage();
    common.name = 'Common';
    figma.root.appendChild(common);
  // Page exists, clear it
  } else {
    common.children.forEach(c => c.remove());
  }

  // Create "Primitives" page
  let primitives = figma.root.children.find(p => p.name === 'Primitives');
  if (!primitives) {
    primitives = figma.createPage();
    primitives.name = 'Primitives';
    figma.root.appendChild(primitives);
  // Page exists, clear it
  } else {
    primitives.children.forEach(c => c.remove());
  }
  
  // Focus frame
  figma.notify(`Importing EXO components...`, {
    timeout: 3000,
    button: {
      text: 'View',
      action: () => focusNode(common.id),
    }
  });

  // TODO: create sections

  // Get relevant data
  const icons = getIconComponentMap();
  const variables = figma.variables.getLocalVariables();

  // Create primitive components
  await createComponents(primitives, iconSet, icons, variables, EXO_PRIMITIVES);

  // Create common components
  await createComponents(common, iconSet, icons, variables, EXO_COMPONENTS);
}

export async function createComponents(
  root: PageNode,
  iconSet: string,
  icons: Record<string, string>,
  variables: Variable[],
  exoComponents: ExoComponents,
) {
  const batch = 5;
  const delay = 5;
  let i = 0;

  for await (const [sectionName, components] of Object.entries(exoComponents)) {
    // Create section
    const background = variables.find(v => v.name === 'background');
    const section = figma.createSection();
    section.name = sectionName;
    section.x = components.rect.x;
    section.y = components.rect.y;
    section.resizeWithoutConstraints(components.rect.width, components.rect.height);
    try {section.devStatus = {type: 'READY_FOR_DEV'}} catch (err) {}
    if (background) {
      const fills = section.fills !== figma.mixed ? {...section.fills} : {};
      fills[0] = figma.variables.setBoundVariableForPaint(fills[0], 'color', background);
      section.fills = [fills[0]];
    }
    // Create components in section
    for await (const [key, isComponentSet, x, y] of Object.values(components.list)) {
      if (i++ % batch === 0)
        await wait(delay);
      const origin = isComponentSet
        ? await figma.importComponentSetByKeyAsync(key)
        : await figma.importComponentByKeyAsync(key);
      const local = origin.clone();
      local.x = x;
      local.y = y;
      replaceComponentSwaps(local, iconSet, icons);
      replaceBoundVariables(local, variables);
      section.appendChild(local);
    }
    // Add section to page
    root.appendChild(section);
  }
}

function replaceComponentSwaps(
  component: ComponentNode | ComponentSetNode,
  iconSet: string,
  icons: Record<string, string>,
) {
  for (const [prop, value] of Object.entries(component.componentPropertyDefinitions)) {
    // Not a swap
    if (value.type !== 'INSTANCE_SWAP')
      continue;
    // No node id
    if (typeof value.defaultValue !== 'string')
      continue;
    // Not an icon swap
    const originNode = figma.getNodeById(value.defaultValue);
    if (isNodeIcon(originNode))
      continue;
    // Find icon in local set first, fallback to global set
    const [originSet, originName] = originNode.name.split(':');
    const uriOrigin = `${originSet}:${originName}`;
    const uriLocal = `${iconSet}:${originName}`;
    const iconLocal = figma.getNodeById(icons[uriLocal]) as ComponentNode;
    const iconNode = iconLocal || figma.getNodeById(icons[uriOrigin]) as ComponentNode;
    // No icon node found
    if (!iconNode) continue;
    // Replace all instances of this icon swap
    const instances = component.findAllWithCriteria({types: ['INSTANCE']});
    const iconInstances = instances.filter(i => i.componentPropertyReferences.mainComponent === prop);
    iconInstances.forEach(i => i.swapComponent(iconNode));
    console.log(icons[uriLocal], icons[uriOrigin], iconLocal, iconNode);
  }
}

function replaceBoundVariables(
  component: ComponentNode | ComponentSetNode,
  variables: Variable[],
) {
  const nodes = component.findAll() as (SceneNode & MinimalFillsMixin & MinimalStrokesMixin)[];
  if (!nodes.length) return;
  for (const node of nodes) {
    for (const [key, value] of Object.entries(node.boundVariables)) {
      if (value instanceof Array) {
        for (const v of value) {
          if (v.type === 'VARIABLE_ALIAS') {
            const origin = figma.variables.getVariableById(v.id);
            const local = variables.find(v => v.name === origin.name);
            if (local) {
              if (key === 'fills') {
                const fills = node.fills !== figma.mixed ? {...node.fills} : {};
                fills[0] = figma.variables.setBoundVariableForPaint(fills[0], 'color', local);
                node.fills = [fills[0]];
              } else if (key === 'strokes') {
                const strokes = node.strokes ? {...node.strokes} : {};
                strokes[0] = figma.variables.setBoundVariableForPaint(strokes[0], 'color', local);
                node.strokes = [strokes[0]];
              } else {
                node.setBoundVariable(key as VariableBindableNodeField, local.id);
              }
            }
          }
        }
      }
    }
  }
}
