import type {Display} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types';

export default (display: Display, options: ParseDeclarationOptionsWithValueWarning) => {
  if (display.type === 'keyword') {
    if (display.value === 'none') {
      return display.value;
    } else {
      return options.addValueWarning(display.value);
    }
  } else if (display.type === 'pair') {
    if (display.outside === 'block') {
      switch (display.inside.type) {
        case 'flow':
          if (display.isListItem) {
            return options.addValueWarning('list-item');
          } else {
            return options.addValueWarning('block');
          }
        case 'flow-root':
          return options.addValueWarning('flow-root');
        case 'table':
          return options.addValueWarning(display.inside.type);
        case 'flex':
          return display.inside.type;
        case 'grid':
          // Grid display is supported via react-native-flexible-grid
          return display.inside.type;
        case 'box':
        case 'ruby':
          return options.addValueWarning(display.inside.type);
      }
    } else {
      switch (display.inside.type) {
        case 'flow':
          return options.addValueWarning('inline');
        case 'flow-root':
          return options.addValueWarning('inline-block');
        case 'table':
          return options.addValueWarning('inline-table');
        case 'flex':
          return options.addValueWarning('inline-flex');
        case 'grid':
          // Inline grid not directly supported, but we can handle as grid
          return 'grid';
        case 'box':
          return options.addValueWarning('inline-grid');
        case 'ruby':
          return options.addValueWarning(display.inside.type);
      }
    }
  }
}
