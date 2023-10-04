import {diff} from 'deep-object-diff';
import {generateStyles} from 'plugin/css';
import {getInstanceInfo, isNodeVisible, convertAssets, getCustomReaction} from 'plugin/fig/lib';
import {createIdentifierCamel} from 'common/string';
import {wait} from 'common/delay';

import type {ParseData, ParseMetaData, ParseNodeTree, ParseStyles} from 'types/parse';
import type {Settings} from 'types/settings';

const NODES_WITH_STYLES = ['TEXT', 'FRAME', 'SECTION', 'COMPONENT', 'RECTANGLE', 'ELLIPSE'];

export default async function parse(
  node: ComponentNode,
  settings: Settings,
  isPreview: boolean,
): Promise<ParseData> {
  if (!node) return;

  // DEBUG
  const start = Date.now();

  const {dict, tree, meta} = crawlNodes(node.children);
  const [root, frame, children] = await Promise.all([
    parseRoot(node, settings),
    parseFrame(node, settings),
    parseChildren(dict, settings),
  ]);

  const variants = await crawlVariants(node, root, children, tree, meta.assetNodes, settings);
  const assets = await convertAssets(meta.assetNodes, isPreview);
  
  if (assets.hasImage)
    meta.primitives.add('Image');

  const data: ParseData = {
    root,
    frame,
    children,
    tree,
    meta,
    variants,
    assets: assets.data,
  };

  // DEBUG
  console.log(`parse: ${Date.now() - start}ms (${dict.size} nodes)`, data);

  return data;
}

async function parseRoot(node: ComponentNode, settings: Settings): Promise<ParseData['root']> {
  return {
    node,
    slug: 'root',
    click: getCustomReaction(node),
    styles: await generateStyles(node, settings),
  };
}

async function parseFrame(node: ComponentNode, settings: Settings) {
  if (node.parent.type !== 'FRAME') return null;
  return {
    node: node.parent,
    slug: 'frame',
    styles: await generateStyles(node.parent, settings),
  };
}

async function parseChildren(nodes: Set<SceneNode>, settings: Settings) {
  const children: Array<{node: SceneNode, styles: ParseStyles, slug: string}> = [];
  for await (const node of nodes) {
    // Prevents UI from freezing
    await wait(0);
    const slugBase = createIdentifierCamel(node.name);
    const slugCount = children.filter((c) => createIdentifierCamel(c.node.name) === slugBase).length;
    const slug = slugCount > 0 ? `${slugBase}${slugCount+1}` : slugBase;
    const styles = NODES_WITH_STYLES.includes(node.type)
      ? await generateStyles(node, settings)
      : null
    children.push({node, slug, styles});
  }
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
  meta = meta || {
    primitives: new Set(),
    assetNodes: new Set(),
    components: {},
    includes: {},
  };
  
  for (const node of nodes) {
    // Skip nodes that are not visible and not conditionally rendered
    if (!isNodeVisible(node)) continue;

    // Handle asset nodes differently
    const isAsset = (node.isAsset && node.type !== 'INSTANCE') || node.type === 'VECTOR';
    if (isAsset) {
      meta.assetNodes.add(node.id);
      dict.add(node);
      tree.push({node});
      continue;
    }

    // Handle other nodes
    switch (node.type) {
      case 'FRAME':
        meta.primitives.add('View');
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
          meta.includes[info.main.id] = [info.main, node];
        // Subcomponent (w/ components possibly in props)
        } else {
          meta.components[info.main.id] = [info.main, node];
          Object.keys(info.props).forEach((key) => {
            const {type, value} = info.props[key];
            if (type === 'INSTANCE_SWAP' && typeof value === 'string') {
              const swapComponent = figma.getNodeById(value);
              const swapPropsRef = (swapComponent as ComponentNode)?.instances?.[0]?.componentPropertyReferences;
              let swapInvisible = false; 
              // If a linked visible prop is false for the component swap, do not include component
              if (typeof node.componentProperties[swapPropsRef.visible] !== 'undefined') {
                if ((node.componentProperties[swapPropsRef.visible] as any)?.value === false)
                  swapInvisible = true;
              }
              if (!swapInvisible) {
                meta.components[swapComponent.id] = [swapComponent, node];
              }
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
  node: ComponentNode,
  root: {node: ComponentNode, styles: ParseStyles},
  children: {node: SceneNode, styles: ParseStyles}[],
  _rootTree: ParseNodeTree,
  _assetNodes: Set<string>,
  settings: Settings,
) {
  const styles: Record<string, Record<string, unknown>> = {};
  if (!node.variantProperties) return styles;
  const componentSet = node.parent as ComponentSetNode;
  const componentVariants = componentSet.children
    .filter((n: ComponentNode) => n !== componentSet.defaultVariant) as ComponentNode[];

  for await (const variant of componentVariants) {
    // Variant name
    const variantName = variant.name;

    // TODO: Variant children
    // const {tree} = crawlNodes(variant.children);
    //const treeDiff = diff(rootTree, tree);
  
    // Root style variants
    const variantRoot = await parseRoot(variant, settings);
    const variantRootDiff = diffStyles(root.styles, variantRoot.styles);
    if (Object.keys(variantRootDiff).length > 0) {
      if (!styles['root']) styles['root'] = {};
      styles['root'][variantName] = variantRootDiff;
    }
    // Children style variants
    const variantNodes = crawlNodes(variant.children);
    const variantChildren = await parseChildren(variantNodes.dict, settings);
    for (const child of variantChildren) {
      // Skip nodes without styles
      if (!NODES_WITH_STYLES.includes(child.node.type))
        continue;
      const childIdentifier = createIdentifierCamel(child.node.name);
      // Find sister node (same slug and same type)
      const sisterNode = children.find((c) =>
        createIdentifierCamel(c.node.name) === childIdentifier && c.node.type === child.node.type);
      const stylesDiff = sisterNode
        ? diffStyles(sisterNode.styles, child.styles)
        : child.styles;
      // Add if there is a diff
      if (Object.keys(stylesDiff).length > 0) {
        if (!styles[childIdentifier]) styles[childIdentifier] = {};
        styles[childIdentifier][variantName] = stylesDiff;
      }
      // TODO: diff assets (vector colors)
    }
  }

  return styles;
}

function diffStyles(base: ParseStyles, variant: ParseStyles) {
  const styleDiff = diff(base, variant);
  // TODO: any transformations of diff needed? Do it here
  return styleDiff;
}
