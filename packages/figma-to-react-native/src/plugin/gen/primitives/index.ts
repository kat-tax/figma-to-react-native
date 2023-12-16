import {getComponentTargets} from 'plugin/fig/lib';

import {Slider} from './exo/Slider';

export function generatePrimitives(): Record<string, string> {
  const page = figma.root.children.find(p => p.name === 'Primitives');
  if (!page) return;

  const nodes = page.findAllWithCriteria({types: ['COMPONENT']});
  const primitives: Record<string, string> = {};

  for (const component of getComponentTargets(nodes)) {
    switch (component.name) {
      case 'Switch':
        //console.log('Switch', component);
        break;
      case 'Radio':
        //console.log('Radio', component);
        break;
      case 'Checkbox':
        //console.log('Checkbox', component);
        break;
      case 'Progress':
        //console.log('Progress', component);
        break;
      case 'Slider':
        primitives.Slider = Slider(component);
        break;
    }
  }

  return primitives;
}
