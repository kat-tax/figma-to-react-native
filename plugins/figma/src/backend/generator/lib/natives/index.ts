import {getComponentTargets} from 'backend/parser/lib';

import {Slider} from './exo/Slider';

export async function generateNatives(): Promise<Record<string, string>> {
  const page = figma.root.children.find(p => p.name === 'Native');
  if (!page) return;

  const nodes = page.findAllWithCriteria({types: ['COMPONENT']});
  const natives: Record<string, string> = {};

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
        natives.Slider = await Slider(component);
        break;
    }
  }

  return natives;
}
