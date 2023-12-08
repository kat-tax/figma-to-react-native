import {getInstanceInfo, getCustomReaction, isNodeVisible, isNodeIcon} from 'plugin/fig/lib';
import {getAssets, getStyleSheet, getAllIconComponents, getColorSheet, validate} from './lib';
import {createIdentifierCamel} from 'common/string';

import type {ParseData, ParseRoot, ParseFrame, ParseChild, ParseMetaData, ParseNodeTree, ParseVariantData} from 'types/parse';

const NODES_WITH_STYLES = ['TEXT', 'FRAME', 'SECTION', 'COMPONENT', 'RECTANGLE', 'ELLIPSE'];

export default async function(component: ComponentNode): Promise<ParseData> {
  // Make sure component can be processed
  try {
    validate(component);
  } catch(e) {
    figma.notify(e.message, {error: true, timeout: 5000});
    return null;
  }

  // Profile
  // const _t1 = Date.now();

  // Gather node data relative to conversion
  const data = crawl(component);

  // Generated styles and assets
  const [stylesheet, colorsheet, {assetData, assetMap, hasRaster}] = await Promise.all([
    getStyleSheet(data.meta.styleNodes, data.variants),
    getColorSheet(data.meta.assetNodes, data.variants),
    getAssets(data.meta.assetNodes),
  ]);

  // Add image primitive if needed
  if (hasRaster) {
    data.meta.primitives.add('Image');
  }

  // Profile
  // console.log(`[fig/parse/main] ${Date.now() - _t1}ms`, data, stylesheet);

  return {...data, stylesheet, colorsheet, assetData, assetMap};
}

function crawl(node: ComponentNode) {
  // const _t1 = Date.now();
  const {dict, tree, meta} = crawlChildren(node.children);

  const root = getRoot(node);
  const frame = getFrame(node);
  const children = getChildren(dict);
  const variants = getVariants(node, children);
  const icons = getAllIconComponents();

  meta.iconsList = new Set(icons.map((i) => i.name));
  meta.iconsMap = new Map(icons.map((i) => [i.name, i.id]));

  root && meta.styleNodes.add(root.node.id);
  frame && meta.styleNodes.add(frame.node.id);

  // Profile
  // console.log(`[fig/parse/crawl] ${Date.now() - _t1}ms (${dict.size} nodes)`, tree);

  return {
    tree,
    meta,
    root,
    frame,
    children,
    variants,
  };
}

function crawlChildren(
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
    styleNodes: new Set(),
    iconsList: new Set(),
    iconsUsed: new Set(),
    iconsMap: new Map(),
    components: {},
    includes: {},
  };
  
  for (const node of nodes) {
    // Skip nodes that are not visible and not conditionally rendered
    if (!isNodeVisible(node)) continue;

    // Record asset nodes to be exported, nothing further is needed
    const isInstance = node.type === 'INSTANCE';
    const isAsset = (node.isAsset && !isInstance) || node.type === 'VECTOR';
    if (isAsset) {
      meta.assetNodes.add(node.id);
      dict.add(node);
      tree.push({node});
      continue;
    }

    // Record nodes with styles
    if (NODES_WITH_STYLES.includes(node.type) && !node.isAsset) {
      meta.styleNodes.add(node.id);
    }

    // Handle other nodes
    switch (node.type) {
      case 'FRAME':
        meta.primitives.add('View');
      // Container, recurse
      case 'COMPONENT':
        const sub = crawlChildren(node.children, dict, [], meta);
        meta.components = {...meta.components, ...sub.meta.components};
        meta.iconsUsed = new Set([...meta.iconsUsed, ...sub.meta.iconsUsed]);
        meta.assetNodes = new Set([...meta.assetNodes, ...sub.meta.assetNodes]);
        meta.primitives = new Set([...meta.primitives, ...sub.meta.primitives]);
        meta.includes = {...meta.includes, ...sub.meta.includes};
        dict = new Set([...dict, node, ...sub.dict]);
        tree.push({node, children: sub.tree});
        break;
      // Instance swap
      case 'INSTANCE':
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
              // If swap componet is icon, no need to import, just record the name
              if (isNodeIcon(swapComponent)) {
                meta.iconsUsed.add(swapComponent.name);
              // If swap component not invisible, add to import list
              } else if (!swapInvisible) {
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

function getRoot(node: ComponentNode): ParseRoot {
  return {node, slug: 'root', click: getCustomReaction(node)};
}

function getFrame(node: ComponentNode): ParseFrame {
  if (node.parent.type !== 'FRAME') return null;
  return {node: node.parent, slug: 'frame'};
}

function getChildren(nodes: Set<SceneNode>): ParseChild[] {
  const children: ParseChild[] = [];
  for (const node of nodes) {
    const id = createIdentifierCamel(node.name);
    const ref = children.filter((c) => id === createIdentifierCamel(c.node.name)).length;
    const slug = ref > 0 ? `${id}${ref+1}` : id;
    children.push({node, slug});
  }
  return children;
}

function getVariants(root: ComponentNode, rootChildren: ParseChild[]) {
  const variants: ParseVariantData = {
    mapping: {},
    classes: {},
    fills: {},
  };

  if (!root || !root.variantProperties)
    return null;

  const compSet = root.parent as ComponentSetNode;
  const compVars = compSet.children.filter((n: ComponentNode) =>
    n !== compSet.defaultVariant
  ) as ComponentNode[];

  for (const variant of compVars) {
    // Variant root mapping
    variants.mapping[variant.id] = {};
    variants.mapping[variant.id][root.id] = variant.id;

    // Variant root class (exclude default)
    if (!variants.classes.root)
      variants.classes.root = {};
      variants.classes.root[variant.name] = variant.id;

    // Variant children mapping, classes, and fills
    if (variant.children) {
      const nodes = crawlChildren(variant.children);
      const children = getChildren(nodes.dict);
      for (const child of children) {
        if (!child || !child.node) continue;

        // Find matching base node
        const childId = createIdentifierCamel(child?.node.name);
        const baseNode = rootChildren.find((c) =>
          createIdentifierCamel(c?.node.name) === childId
          && c?.node.type === child?.node.type
        );

        // Map variant child nodes
        variants.mapping[variant.id][baseNode?.node.id] = child?.node.id;
  
        // Node with fills
        if (child?.node?.isAsset) {
          if (!variants.fills[childId])
            variants.fills[childId] = {};
          variants.fills[childId][variant.name] = child?.node.id;
        }

        // Node with styles
        if (NODES_WITH_STYLES.includes(child?.node.type)) {
          if (!variants.classes[childId])
            variants.classes[childId] = {};
          variants.classes[childId][variant.name] = child?.node.id;
        }
      }
    }
  }

  return variants;
}
