import {diff} from 'deep-object-diff';
import {generateStyles} from 'modules/css';
import {convertAssets, getInstanceInfo, isNodeVisible, getSlug, getIdentifier} from 'modules/fig/utils';
import {wait} from 'common/delay';

import type {ParseData, ParseMetaData, ParseNodeTree, TargetNode, NodeStyles} from 'types/figma';
import type {Settings} from 'types/settings';

const NODES_WITH_STYLES = ['TEXT', 'GROUP', 'FRAME', 'SECTION', 'COMPONENT', 'RECTANGLE', 'ELLIPSE'];

export default async function parse(node: TargetNode, settings: Settings): Promise<ParseData> {
  if (!node) return;
  const start = Date.now();
  const {dict, tree, meta} = crawlNodes(node.children);
  const [root, children] = await Promise.all([
    parseRoot(node, settings),
    parseChildren(dict, settings),
  ]);
  const variants = await crawlVariants(node, root, children, settings);
  const assets = await convertAssets(meta.assetNodes);
  const data = {root, children, tree, meta, assets, variants};
  console.log(`parse: ${Date.now() - start}ms (${dict.size} nodes)`, data);
  return data;
}

async function parseRoot(node: TargetNode, settings: Settings) {
  const styles = await generateStyles(node as SceneNode, settings);
  return {node, styles};
}

async function parseChildren(nodes: Set<SceneNode>, settings: Settings) {
  // const start = Date.now();
  const children: Array<{node: SceneNode, styles: NodeStyles}> = [];
  for await (const node of nodes) {
    await wait(0); // note: prevents UI from freezing
    const styles = NODES_WITH_STYLES.includes(node.type)
      ? await generateStyles(node, settings)
      : null;
    children.push({node, styles});
  }
  // console.log(`parseChildren: ${Date.now() - start}ms (${nodes.size} nodes)`);
  return children;
}

function crawlNodes(
  nodes: readonly SceneNode[],
  dict?: Set<SceneNode>,
  tree?: ParseNodeTree,
  meta?: ParseMetaData,
) {
  dict = dict || new Set();
  tree = tree || [];
  meta = meta || {primitives: new Set(), assetNodes: new Set(), components: {}, includes: {}};
  for (const node of nodes) {
    // Skip nodes that are not visible and not conditionally rendered
    if (!isNodeVisible(node)) continue;

    // Handle asset nodes differently
    if (node.isAsset && node.type !== 'INSTANCE') {
      meta.primitives.add('Image');
      meta.assetNodes.add(node.id);
      dict.add(node);
      tree.push({node});
      continue;
    }

    // Handle other nodes
    switch (node.type) {
      case 'GROUP':
      case 'FRAME':
      case 'SECTION':
      case 'COMPONENT':
        // Container, recurse
        const sub = crawlNodes(node.children, dict, [], meta);
        meta.primitives = new Set([...meta.primitives, ...sub.meta.primitives]);
        meta.assetNodes = new Set([...meta.assetNodes, ...sub.meta.assetNodes]);
        meta.components = {...meta.components, ...sub.meta.components};
        meta.includes = {...meta.includes, ...sub.meta.includes};
        dict = new Set([...dict, node, ...sub.dict]);
        tree.push({node, children: sub.tree});
        break;
      case 'INSTANCE':
        // Instance swap
        const info = getInstanceInfo(node);
        if (info.propName) {
          meta.includes[info.main.id] = info.main;
        // Subcomponent (w/ components possibly in props)
        } else {
          meta.components[info.main.id] = info.main;
          Object.keys(info.props).forEach((key) => {
            const {type, value} = info.props[key];
            if (type === 'INSTANCE_SWAP' && typeof value === 'string') {
              const swapComponent = figma.getNodeById(value);
              meta.components[swapComponent.id] = swapComponent;
            }
          });
        }
        dict.add(node);
        tree.push({node});
        break;
      case 'TEXT':
        meta.primitives.add('Text');
        dict.add(node);
        tree.push({node});
        break;
      case 'RECTANGLE':
        dict.add(node);
        tree.push({node});
    }
  }
  return {dict, tree, meta};
}

async function crawlVariants(
  node: TargetNode,
  root: {node: TargetNode, styles: NodeStyles},
  children: {node: SceneNode, styles: NodeStyles}[],
  settings: Settings,
) {
  const styles: Record<string, Record<string, unknown>> = {};
  if (!(node as ComponentNode).variantProperties) return styles;
  const componentSet = node.parent as ComponentSetNode;
  const componentVariants = componentSet.children
    .filter((n: ComponentNode) => n !== componentSet.defaultVariant) as ComponentNode[];

  for await (const variant of componentVariants) {
    // Variant name
    const name = getIdentifier(variant.name);
    // Root style variants
    const variantRoot = await parseRoot(variant, settings);
    const variantRootDiff = diffStyles(root.styles, variantRoot.styles);
    if (Object.keys(variantRootDiff).length > 0) {
      if (!styles['root']) styles['root'] = {};
      styles['root'][name] = variantRootDiff;
    }
    // Children style variants
    const variantNodes = crawlNodes(variant.children);
    const variantChildren = await parseChildren(variantNodes.dict, settings);
    for (const child of variantChildren) {
      // Skip nodes without styles
      if (!NODES_WITH_STYLES.includes(child.node.type))
        continue;
      const childSlug = getSlug(child.node.name);
      // Find sister node (same slug and same type)
      // TODO: this is a bit hacky, but it works for now
      const sisterNode = children.find((c) =>
        getSlug(c.node.name) === childSlug && c.node.type === child.node.type);
      const stylesDiff = sisterNode ? diffStyles(sisterNode.styles, child.styles) : child.styles;
      if (Object.keys(stylesDiff).length > 0) {
        if (!styles[childSlug]) styles[childSlug] = {};
        styles[childSlug][name] = stylesDiff;
      }
    }
  }

  return styles;
}

function diffStyles(base: NodeStyles, variant: NodeStyles) {
  const styleDiff = diff(base, variant);
  // TODO: any transformations of diff needed? Do it here
  return styleDiff;
}
