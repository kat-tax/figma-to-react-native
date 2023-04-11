import {parseNodes} from 'modules/parse/nodes';
import {parseStyles} from 'modules/parse/styles';
import {generateComponent} from 'modules/generate/component';
import {generatePreview} from 'modules/generate/preview';
import {generateStory} from 'modules/generate/story';
import {getName} from 'utils/figma';

import type {EditorComponent, EditorLinks} from 'types/editor';
import type {ParsedComponent} from 'types/parse';
import type {TargetNode} from 'types/figma';
import type {Settings} from 'types/settings';

export function generateBundle(component: TargetNode, settings: Settings, noPreview?: boolean): EditorComponent {
  if (!component) {
    return {name: '', props: null,  code: '', story: '', preview: '', links: {}};
  }

  const isVariant = !!component.variantProperties;
  const props = isVariant
    ? component?.parent.componentPropertyDefinitions
    : component.componentPropertyDefinitions;

  const links: EditorLinks = {};
  const root: ParsedComponent = {
    id: component.id,
    tag: 'View',
    slug: 'root',
    node: component,
    name: getName(isVariant ? component.parent.name : component.name),
    styles: parseStyles(component, true),
  };

  const children = parseNodes([...component.children]);
  Object.entries(children.state.components).forEach((c: any) => {
    links[getName(c[1].name)] = c[0];
  });

  return {
    props,
    links,
    name: root.name,
    code: generateComponent(root, children, settings),
    story: generateStory(root, settings),
    preview: !noPreview ? generatePreview(root, children, settings) : '',
  };
}
