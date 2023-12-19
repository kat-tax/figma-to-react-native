import {wait} from 'common/delay';
import {focusNode} from 'plugin/fig/lib';
import {getIconComponentMap} from 'plugin/lib/icons';

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

  // Get relevant data
  const icons = getIconComponentMap();
  const variables = figma.variables.getLocalVariables();

  // Create primitive components
  await createComponents(primitives, iconSet, icons, variables, {
    Slider: ['35f02e59aa82623edd3e65a47ae53d0d8c93b190', false],
  });

  // Create common components
  await createComponents(common, iconSet, icons, variables, {
    Button: ['e4b4b352052ba71c847b20b49d9e88a0093d4449', true],
  });

  // TODO: create sections
}

export async function createComponents(
  root: PageNode,
  iconSet: string,
  icons: Record<string, string>,
  variables: Variable[],
  components: Record<string, [string, boolean]>,
) {
  const batch = 5;
  const delay = 5;
  let i = 0;
  for await (const [key, isComponentSet] of Object.values(components)) {
    if (i++ % batch === 0)
      await wait(delay);
    if (isComponentSet) {
      const origin = await figma.importComponentSetByKeyAsync(key);
      const local = origin.clone();
      swapComponentIcons(local, iconSet, icons);
      swapBoundVariables(local, variables);
      root.appendChild(local);
    } else {
      const origin = await figma.importComponentByKeyAsync(key);
      const local = origin.clone();
      swapComponentIcons(local, iconSet, icons);
      swapBoundVariables(local, variables);
      root.appendChild(local);
      // TODO: create frame
    }
  }
}

function swapComponentIcons(
  component: ComponentNode | ComponentSetNode,
  iconSet: string,
  icons: Record<string, string>,
) {
  for (const [prop, value] of Object.entries(component.componentPropertyDefinitions)) {
    if (value.type === 'INSTANCE_SWAP') {
      // TODO: Find replacement icon
      const iconName = `${iconSet}:placeholder`;
      const iconNode = figma.getNodeById(icons[iconName]) as ComponentNode;
      // Replace all instances of this swap
      const instances = component.findAllWithCriteria({types: ['INSTANCE']})
      const iconInstances = instances.filter(i => i.componentPropertyReferences.mainComponent === prop)
      iconInstances.forEach(i => i.swapComponent(iconNode));
    }
  }
}

function swapBoundVariables(
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