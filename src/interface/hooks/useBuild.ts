import {useState, useEffect} from 'preact/hooks';
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
  icons: {
    used: [],
    list: [],
    map: {},
  },
};

export function useBuild(): ComponentBuild {
  const [build, setBuild] = useState<ComponentBuild>(initial);
  
  useEffect(() => on<EventComponentBuild>('COMPONENT_BUILD', (newBuild, component) => {
    // console.log('[build]', component.name, newBuild);
    setBuild(newBuild);
    $.doc.transact(() => {
      $.setProjectIndex(newBuild.index);
      $.setProjectFiles(Object.keys(newBuild.roster));
      $.setComponentCode(component.name, component.code);
      $.setComponentIndex(component.name, component.index);
      $.setComponentStory(component.name, component.story);
      $.components.set(component.name, {
        id: component.id,
        page: component.page,
        name: component.name,
        props: component.props,
      });
    });
    // console.log('[build]', component.name, newBuild);
  }), []);

  return build;
}
