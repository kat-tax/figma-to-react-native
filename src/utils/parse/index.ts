import {getTag, getName, getSlug} from 'utils/parse/helpers';
import {getStyle} from 'utils/parse/style';

export default function parse(
  children: any,
  depth = 0,
  deps = [],
  styles = {},
  components = {},
) {
  // Lines of codes will be inserted here
  let code = [];

  // Loop through each direct child node
  children.forEach((child: any) => {
    // Detect child type
    const isText = child.type === 'TEXT';
    const isImage = child.type === 'IMAGE';
    const isGroup = child.type === 'GROUP' || child.type === 'FRAME';
    const isInstance = child.type === 'INSTANCE';
    const isVariant = isInstance && !!child.variantProperties;
  
    // Create identifiers
    const tag = getTag(child.type);
    const slug = getSlug(child.name);
  
    // Transform styles for child
    styles[slug] = {tag, style: getStyle(child)};
  
    // Include primitives in dependencies
    if (isText && !deps.includes('Text'))
      deps.push('Text');
    if (isImage && !deps.includes('Image'))
      deps.push('Image');

    // Text nodes get inserted
    if (isText) {
      code.push({slug, tag: 'Text', value: child.characters || ''});
    }

    // Instances get inserted and master component + props saved
    if (isInstance && !isVariant) {
      code.push({tag: getName(child.name), props: child.componentProperties});
      components[child.masterComponent.id] = child.masterComponent;

    // Variants are similar to instances but you have to look one parent up
    } else if (isVariant) {
      code.push({tag: getName(child.name), props: child.componentProperties});
      components[child.masterComponent.parent.id] = child.masterComponent.parent;

    // Group nodes get recursed and inserted, styles and components are aggregated
    } else if (isGroup) {
      const content = parse([...child.children], depth + 1, deps, styles, components);
      components = {...components, ...content.components};
      styles = {...styles, ...content.styles};
      code.push({slug, tag: 'View', children: content.code});
    }
  });

  // Return lines of code, primitives, styles, and components
  return {code, deps, styles, components};
}
