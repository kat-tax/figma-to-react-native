import CodeBlockWriter from 'code-block-writer';
import parseFigmaComponent from 'backend/parser';
import {getComponentInfo} from 'backend/parser/lib';
import {createIdentifierPascal} from 'common/string';
import {writePropsAttributes} from './writePropsAttributes';
import {writePropsImports} from './writePropsImports';
import {generateComponent} from './generateComponent';
import {generateIndex} from './generateIndex';
import {generateDocs} from './generateDocs';
import {generateStory} from './generateStory';
import {generateNatives} from '../lib/natives';
import {PAGES_SPECIAL} from './consts';

import type {ComponentData, ComponentLinks} from 'types/component';
import type {ProjectSettings} from 'types/settings';

const emptyBundle: ComponentData = {
  id: '',
  key: '',
  props: '',
  imports: '',
  code: '',
  index: '',
  story: '',
  docs: '',
  width: 0,
  height: 0,
  links: {},
  assets: null,
  icons: [],
  info: null,
};

export async function generateBundle(
  node: ComponentNode,
  cssVars: string,
  settings: ProjectSettings,
): Promise<ComponentData> {
  // No node, return empty bundle
  if (!node) return emptyBundle;

  // Get component info
  const component = getComponentInfo(node);

  // No target, return empty bundle
  if (!component.target) return emptyBundle;

  // Generate exo natives (if any)
  const isExo = component.page.name === PAGES_SPECIAL.LIBRARY;
  const exo = generateNatives();

  // Native component
  if (isExo && exo[node.name]) {
    return {
      ...emptyBundle,
      id: node.id,
      key: node.key,
      width: node.width,
      height: node.height,
      code: exo[node.name],
      info: component,
    };
  }

  // Normal component, parse figma data
  const data = await parseFigmaComponent(node, cssVars);

  // No data, return empty bundle
  if (!data) return emptyBundle;
  
  // Component links (TODO: use component.paths instead)
  const links: ComponentLinks = {};
  links[component.name] = component.target.id;
  Object.entries(data.meta.components).forEach((c: any) => {
    links[createIdentifierPascal(c[1][0].name)] = c[0];
  });

  // Return bundle
  return {
    // Info
    id: component.target.id,
    key: component.target.key,
    props: writePropsAttributes(
      new CodeBlockWriter(settings.writer),
      {...component.propDefs},
    ),
    imports: writePropsImports(
      new CodeBlockWriter(settings.writer),
      {...component.propDefs},
    ),
    // Text
    code: await generateComponent(data, settings),
    index: generateIndex([component], settings, false),
    story: generateStory(component, settings),
    docs: generateDocs(component, settings),
    // Rect
    width: data.frame ? data.frame.node.width : data.root.node.width,
    height: data.frame ? data.frame.node.height : data.root.node.height,
    // Data
    assets: Object.values(data.assetData),
    icons: Array.from(data.meta.iconsUsed),
    // Meta
    info: component,
    links,
  };
}
