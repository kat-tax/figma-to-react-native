import {getTag, getSlug} from 'utils/parse/helpers';
import {getStyle} from 'utils/parse/style';

export default function parse(
  children,
  depth = 0,
  deps = [],
  styles = {},
) {
  let code = [];

  children.reverse().forEach(child => {
    const isText = child.type === 'TEXT';
    const isGroup = child.type === 'GROUP';
    const slug = getSlug(child.name);
    const tag = getTag(child.type);

    styles[slug] = {tag, style: getStyle(child)};
  
    if (isText && deps.indexOf('Text') === -1) {
      deps.push('Text');
    }

    if (isText) {
      code.push({slug, tag: 'Text', value: child.characters || ''});
    }

    if (isGroup) {
      const content = parse([...child.children], depth + 1, deps, styles);
      styles = {...styles, ...content.styles};
      code.push({slug, tag: 'View', children: content.code});
    }
  });

  return {code, deps, styles};
}
