import {useState, useEffect} from 'react';
import {on} from '@create-figma-plugin/utilities';
import * as $ from 'interface/store';

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
  icons: [],
};

export function useBuild(): ComponentBuild {
  const [build, setBuild] = useState<ComponentBuild>(initial);
  
  useEffect(() => on<EventComponentBuild>('COMPONENT_BUILD', (newBuild, component) => {
    setBuild(newBuild);
    $.doc.transact(() => {
      $.setProjectIndex(newBuild.index);
      $.setProjectFiles(Object.keys(newBuild.roster));
      $.setComponentCode(component.key, component.code);
      $.setComponentIndex(component.key, component.index);
      $.setComponentStory(component.key, component.story);
      $.setComponentDocs(component.key, component.docs);
      Object.values(build.assets).forEach(asset =>
        $.assets.set(`${asset.name}.${asset.isVector ? 'svg' : 'png'}`, asset.bytes));
      const {id, key, info, props, width, height} = component;
      const {name, page, path} = info;
      $.components.set(component.key, {id, key, name, page, path, props, width, height});
    });
  }), []);

  return build;
}
