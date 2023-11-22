import {useState, useEffect} from 'preact/hooks';
import {on} from 'common/events';
import * as $ from 'interface/store';

import type {EventComponentBuild} from 'types/events';
import type {ComponentBuild} from 'types/component';

const initial: ComponentBuild = {
  loaded: 0,
  total: 0,
  assets: 0,
  pages: [],
  roster: {},
};

export function useBuild(): ComponentBuild {
  const [build, setBuild] = useState<ComponentBuild>(initial);

  useEffect(() => on<EventComponentBuild>('COMPONENT_BUILD', (newBuild, component) => {
    // Update build status
    setBuild(newBuild);
    // Update built component
    $.doc.transact(() => {
      $.setComponentCode(component.key, component.code);
      $.setComponentIndex(component.key, component.index);
      $.setComponentStory(component.key, component.story);
      $.components.set(component.key, {
        id: component.id,
        key: component.key,
        page: component.page,
        name: component.name,
        props: component.props,
      });
      console.log('transact', component.key);
    });
  }), []);

  return build;
}
