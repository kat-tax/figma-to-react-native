import {useState, useEffect} from 'preact/hooks';
import {on} from '@create-figma-plugin/utilities';
import * as $ from 'interface/store';

import type {EventComponentBuild, EventProjectTheme} from 'types/events';
import type {ComponentBuild} from 'types/component';

const initial: ComponentBuild = {
  loaded: 0,
  total: 0,
  pages: [],
  roster: {},
  assets: {},
  assetMap: {},
  index: '',
};

export function useBuild(): ComponentBuild {
  const [build, setBuild] = useState<ComponentBuild>(initial);
  
  useEffect(() => on<EventComponentBuild>('COMPONENT_BUILD', (newBuild, component) => {
    setBuild(newBuild);
    $.doc.transact(() => {
      $.setProjectFiles(Object.keys(newBuild.roster));
      $.setProjectIndex(newBuild.index);
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
    console.log('[build]', component.name, newBuild);
  }), []);

  useEffect(() => on<EventProjectTheme>('PROJECT_THEME', (_theme) => {
    if (_theme !== $.getProjectTheme().toString())
      $.setProjectTheme(_theme);
  }), []);

  return build;
}
