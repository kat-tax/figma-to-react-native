import {generateBundle, generateTheme} from 'backend/generator';
import * as config from 'backend/config';

export async function render(node: SceneNode): Promise<CodegenResult[]> {
  if (!node || node.type !== 'COMPONENT') return [];
  const {bundle} = await generateBundle(node, config.state);
  const {code} = generateTheme(config.state);
  return bundle.code ? [
    {
      language: 'TYPESCRIPT',
      title: `${bundle.name}.tsx`,
      code: bundle.code,
    },
    {
      language: 'TYPESCRIPT',
      title: `${bundle.name}.story.tsx`,
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
  const newConfig = {...config.state};
  let configChanged = false;
  settings.forEach(([key, value]) => {
    switch (key) {
      case 'tab-size': {
        const newValue = parseInt(value, 10);
        if (newValue !== config.state.writer.indentNumberOfSpaces) {
          newConfig.writer.indentNumberOfSpaces = newValue;
          configChanged = true;
        }
        break;
      }
      case 'quote-style': {
        const newValue = value === 'single';
        if (newValue != config.state.writer.useSingleQuote) {
          newConfig.writer.useSingleQuote = newValue;
          configChanged = true;
        }
        break;
      }
      case 'white-space': {
        const newValue = value === 'tabs';
        if (newValue !== config.state.writer.useTabs) {
          newConfig.writer.useTabs = newValue;
          configChanged = true;
        }
        break;
      }
      case 'translate': {
        const newValue = value === 'on';
        if (newValue !== config.state.react.addTranslate) {
          newConfig.react.addTranslate = newValue;
          configChanged = true;
        }
        break;
      }
    }
  });

  if (configChanged) {
    config.update(newConfig, false);
  }
}
