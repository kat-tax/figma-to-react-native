import * as consts from 'config/consts';
import * as parser from 'backend/parser/lib';

import {Slider} from './exo/Slider';

export function generateNatives(): Record<string, string> {
  const page = figma.root.children.find(p => p.name === consts.PAGES_SPECIAL.LIBRARY);
  if (!page) return;

  const nodes = page.findAllWithCriteria({types: ['COMPONENT']});
  const natives: Record<string, string> = {};

  for (const component of parser.getComponentTargets(nodes)) {
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
        natives.Slider = Slider(component);
        break;
    }
  }

  return natives;
}
