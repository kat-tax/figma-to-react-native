import * as parser from './lib';
import {createIdentifierCamel} from 'common/string';
import type {ParseData, ParseRoot, ParseFrame, ParseChild, ParseMetaData, ParseNodeTree, ParseVariantData, ParseIconData} from 'types/parse';

const NODES_WITH_STYLES = ['TEXT', 'FRAME', 'GROUP', 'COMPONENT', 'RECTANGLE', 'ELLIPSE'];

export default async function(
  component: ComponentNode,
  variables: string,
): Promise<ParseData> {
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

  // Debug
  // console.log(component.parent.type === 'COMPONENT_SET' ? component.parent.name : component.name, data);

  // Generated styles and assets
  const [localState, stylesheet, {assetData, assetMap}] = await Promise.all([
    parser.getLocalState(),
    parser.getStyleSheet(data.meta.styleNodes, variables, data.variants),
    parser.getAssets(data.meta.assetNodes),
  ]);

  // Profile
  // console.log(`[fig/parse/main] ${Date.now() - _t1}ms`, data, stylesheet);

  return {...data, localState, stylesheet, assetData, assetMap};
}

export function crawl(node: ComponentNode) {
  // const _t1 = Date.now();
  const {dict, tree, meta} = crawlChildren(node.children);

  const root = getRoot(node);
  const frame = getFrame(node);
  const children = getChildren(dict);
  const variants = getVariants(node, children);

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
    assetNodes: new Set(),
    styleNodes: new Set(),
    iconsUsed: new Set(),
    components: {},
    includes: {},
    icons: {},
  };
  
  for (const node of nodes) {
    // Skip nodes that are not visible and not conditionally rendered
    if (!parser.isNodeVisible(node)) continue;

    // Node types
    const isInstance = node.type === 'INSTANCE';
    const isVector = node.type === 'VECTOR';
    const isIcon = parser.isNodeIcon(node);

    // Node states
    const hasAsset = (node.isAsset && !isInstance) || isVector;
    const hasStyle = NODES_WITH_STYLES.includes(node.type) && !node.isAsset;

    // Record asset nodes to be exported, nothing further is needed
    if (hasAsset) {
      meta.assetNodes.add(node.id);
      dict.add(node);
      tree.push({node});
      continue;
    }

    // Record nodes with styles, css will be extracted & converted later
    if (hasStyle) {
      meta.styleNodes.add(node.id);
    }

    // Record icon color and size
    if (isIcon) {
      const iconData = parser.getIconData(node);
      meta.iconsUsed.add(iconData.name);
      meta.icons[node.id] = iconData;
    }

    // Handle other nodes
    switch (node.type) {
      case 'TEXT':
        dict.add(node);
        tree.push({node});
        break;
      case 'RECTANGLE':
        dict.add(node);
        tree.push({node});
        break;
      // Container, recurse
      case 'FRAME':
      case 'GROUP':
      case 'COMPONENT':
        const sub = crawlChildren(node.children, dict, [], meta);
        meta.components = {...meta.components, ...sub.meta.components};
        meta.iconsUsed = new Set([...meta.iconsUsed, ...sub.meta.iconsUsed]);
        meta.assetNodes = new Set([...meta.assetNodes, ...sub.meta.assetNodes]);
        meta.includes = {...meta.includes, ...sub.meta.includes};
        dict = new Set([...dict, node, ...sub.dict]);
        tree.push({node, children: sub.tree});
        break;
      // Instance swap
      case 'INSTANCE':
        const info = parser.getComponentInstanceInfo(node);
        if (info.propName) {
          meta.includes[info.main.id] = [info.main, node];
        } else {
          // Record subcomponent
          if (!parser.isNodeIcon(info.main)) {
            meta.components[info.main.id] = [info.main, node];
          }

          // Record components used in subcomponent props
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
              if (parser.isNodeIcon(swapComponent)) {
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
    }
  }

  return {dict, tree, meta};
}

function validate(component: ComponentNode) {
  // Sanity check
  if (!component || component.type !== 'COMPONENT') {
    throw new Error(`Component not found.`);
  }

  // Disallow certain nodes
  if (component.findAllWithCriteria({types: ['SECTION']}).length > 0) {
    throw new Error(`Sections cannot be inside a component. Convert them to a frame.`);
  }

  // Good to go!
  return true;
}

function getRoot(node: ComponentNode): ParseRoot {
  return {node, slug: 'root', click: parser.getComponentCustomReaction(node)};
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
    icons: {},
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

        // Map node to base node
        const baseNode = rootChildren.find((c) => c.slug === child.slug);
        variants.mapping[variant.id][baseNode?.node.id] = child?.node.id;
  
        // Icon node
        if (parser.isNodeIcon(child.node)) {
          if (!variants.icons[child.slug]) variants.icons[child.slug] = {};
          const iconData = parser.getIconData(child.node);
          variants.icons[child.slug][variant.name] = iconData;
        }

        // Styled node
        if (NODES_WITH_STYLES.includes(child?.node.type)) {
          if (!variants.classes[child.slug]) variants.classes[child.slug] = {};
          variants.classes[child.slug][variant.name] = child?.node.id;
        }
      }
    }
  }

  return variants;
}
