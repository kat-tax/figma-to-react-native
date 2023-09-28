import {generateBundle, generateTheme} from 'plugin/gen';
import * as config from 'plugin/config';

export async function render(node: SceneNode): Promise<CodegenResult[]> {
  if (!node || (node.type !== 'COMPONENT' && node.type !== 'COMPONENT_SET')) return [];
  const bundle = await generateBundle(node, config.state);
  const theme = generateTheme(config.state);
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
      code: theme,
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
      case 'react-import': {
        const newValue = value === 'on';
        if (newValue !== config.state.react.addImport) {
          newConfig.react.addImport = newValue;
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
