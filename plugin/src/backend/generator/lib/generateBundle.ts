import CodeBlockWriter from 'code-block-writer';
import parseComponentData from 'backend/parser';

import {getComponentInfo, getComponentFrameSize} from 'backend/parser/lib';
import {componentPathNormalize} from 'common/string';
import {PAGES_SPECIAL} from 'config/consts';

import {generateNatives} from './natives';
import {generateIndex} from './generateIndex';
import {generateCode} from './generateCode';
import {generateDocs} from './generateDocs';
import {generateStory} from './generateStory';
import {writePropsAttrs} from './writePropsAttrs';
import {writePropsImports} from './writePropsImports';

import type {ProjectSettings} from 'types/settings';
import type {ComponentData, ComponentInfo, ComponentLinks} from 'types/component';

export async function generateBundle(
  node: ComponentNode,
  infoDb: Record<string, ComponentInfo> | null,
  settings: ProjectSettings,
  skipCache: boolean = false,
): Promise<ComponentData> {

  // Resolve component info
  const info = node && getComponentInfo(node, infoDb);
  if (info?.hasError) return {...emptyBundle, info: info};
  if (!info?.target) return emptyBundle;

  // Generate exo natives if matched
  const isExo = info.page.name === PAGES_SPECIAL.LIBRARY;
  const exo = generateNatives();
  const tpl = exo?.[node.name];
  if (isExo && tpl) {
    const {width, height} = node;
    return {...emptyBundle, code: tpl, info, width, height};
  }

  // Normal component, parse figma data
  const data = await parseComponentData(node, skipCache);
  if (!data) return emptyBundle;

  // Map path to node id links
  const links: ComponentLinks = {};
  links[componentPathNormalize(info.path)] = info.target.id;
  Object.values(data.meta.components).forEach(([linkNode]) => {
    const linkInfo = getComponentInfo(linkNode, infoDb);
    links[componentPathNormalize(linkInfo.path)] = linkInfo.target.id;
  });

  // Dimensions for preview container
  const {width, height} = getComponentFrameSize(data.root.node, data.frame?.node);

  // Generate component code and other data
  const [imports, props, code, docs, story, index] = await Promise.all([
    writePropsImports(new CodeBlockWriter(settings.writer), {...info.propDefs}, infoDb),
    writePropsAttrs(new CodeBlockWriter(settings.writer), {props: {...info.propDefs}, infoDb}),
    generateCode(data, settings, infoDb),
    generateDocs(info, settings, infoDb),
    generateStory(info, settings, infoDb),
    generateIndex([info], settings, false),
  ]);

  return {
    // Meta
    info,
    links,
    width,
    height,
    // Data
    code,
    docs,
    story,
    index,
    props,
    imports,
    // Assets
    assets: Object.values(data.assetData),
    icons: {
      list: Array.from(data.meta.iconsUsed),
      count: data.meta.iconCounts,
    },
  } satisfies ComponentData;
}

const emptyBundle: ComponentData = {
  info: null,
  links: {},
  width: 0,
  height: 0,
  code: '',
  docs: '',
  story: '',
  index: '',
  props: '',
  imports: '',
  assets: null,
  icons: {
    list: [],
    count: {},
  },
};
