import {generateBundle} from './lib/generateBundle';
import {generateTheme} from './lib/generateTheme';
import {state, update} from '../utils/config';

export async function render(node: SceneNode): Promise<CodegenResult[]> {
  if (!node || node.type !== 'COMPONENT') return [];
  const bundle = await generateBundle(node, null, state, true);
  const {code} = (await generateTheme(state)).themes;
  return bundle.code ? [
    {
      language: 'TYPESCRIPT',
      title: `${bundle.info.name}.tsx`,
      code: bundle.code,
    },
    {
      language: 'TYPESCRIPT',
      title: `${bundle.info.name}.story.tsx`,
      code: bundle.story,
    },
    {
      language: 'TYPESCRIPT',
      title: `theme.ts`,
      code,
    },
  ] : [];
}

export function handleConfigChange() {
  const settings = Object.entries(figma.codegen.preferences.customSettings);
  const config = {...state};
  let updated = false;
  settings.forEach(([key, value]) => {
    switch (key) {
      case 'tab-size': {
        const newValue = parseInt(value, 10);
        if (newValue !== state.writer.indentNumberOfSpaces) {
          config.writer.indentNumberOfSpaces = newValue;
          updated = true;
        }
        break;
      }
      case 'quote-style': {
        const newValue = value === 'single';
        if (newValue != state.writer.useSingleQuote) {
          config.writer.useSingleQuote = newValue;
          updated = true;
        }
        break;
      }
      case 'white-space': {
        const newValue = value === 'tabs';
        if (newValue !== state.writer.useTabs) {
          config.writer.useTabs = newValue;
          updated = true;
        }
        break;
      }
      case 'translate': {
        const newValue = value === 'on';
        if (newValue !== state.addTranslate) {
          config.addTranslate = newValue;
          updated = true;
        }
        break;
      }
    }
  });
  if (updated) {
    update(config, false);
  }
}
