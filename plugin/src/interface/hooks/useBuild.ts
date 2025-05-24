import {useState, useEffect} from 'react';
import {on} from '@create-figma-plugin/utilities';
import * as $ from 'store';

import type {EventComponentBuild} from 'types/events';
import type {ComponentBuild} from 'types/component';

const initial: ComponentBuild = {
  loaded: 0,
  total: 0,
  index: '',
  pages: [],
  links: {},
  roster: {},
  assets: {},
  assetMap: {},
  icons: {list: [], count: {}},
};

export function useBuild(): ComponentBuild {
  const [build, setBuild] = useState<ComponentBuild>(initial);
  
  useEffect(() => on<EventComponentBuild>('COMPONENT_BUILD', (newBuild, component) => {
    setBuild(newBuild);
    $.doc.transact(() => {
      const {id, key, code, index, story, docs, info, props, imports, width, height} = component;
      const {name, path} = info;
      const page = info.page.name;
      $.projectIndex.set(newBuild.index);
      $.projectFiles.set(Object.keys(newBuild.roster));
      $.component.code(key).set(code);
      $.component.index(key).set(index);
      $.component.story(key).set(story);
      $.component.docs(key).set(docs);
      $.components.set(key, {id, key, name, page, path, props, imports, width, height});
    });
    for (const asset of Object.values(newBuild.assets)) {
      $.assets.set(`${asset.name}.${asset.isVector ? 'svg' : 'png'}`, asset.bytes);
    }
  }), []);

  return build;
}
