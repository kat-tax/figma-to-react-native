import {useState, useEffect} from 'react';
import {on} from '@create-figma-plugin/utilities';
import * as $ from 'store';

import type {EventComponentBuild} from 'types/events';
import type {ComponentBuild} from 'types/component';

const initial: ComponentBuild = {
  index: '',
  links: {},
  total: 0,
  loaded: 0,
  roster: {},
  pages: [],
  assets: {},
  icons: {
    list: [],
    count: {},
  },
  fonts: {
    list: [],
  },
};

export function useBuild(): ComponentBuild {
  const [build, setBuild] = useState<ComponentBuild>(initial);

  useEffect(() => on<EventComponentBuild>('COMPONENT_BUILD', (key, newBuild, component) => {
    setBuild(newBuild);
    $.doc.transact(() => {
      const {info, code, index, story, docs, props, imports, width, height} = component;
      const {name, path, target} = info;
      const {id} = target;
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
