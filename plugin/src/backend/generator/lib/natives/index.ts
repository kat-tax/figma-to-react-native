import {getComponentTargets} from 'backend/parser/lib';
import {PAGES_SPECIAL} from 'config/consts';

import {Slider} from './exo/Slider';

export function generateNatives(): Record<string, string> {
  const page = figma.root.children.find(p => p.name === PAGES_SPECIAL.LIBRARY);
  if (!page) return;
  const nodes = page.findAllWithCriteria({types: ['COMPONENT']});
  const natives: Record<string, string> = {};
  for (const component of getComponentTargets(nodes)) {
    switch (component.name) {
      case 'Switch':
        break;
      case 'Radio':
        break;
      case 'Checkbox':
        break;
      case 'Progress':
        break;
      case 'Slider':
        natives.Slider = Slider(component);
        break;
    }
  }
  return natives;
}
