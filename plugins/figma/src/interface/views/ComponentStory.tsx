import {Fragment} from 'react';
import {LoadingIndicator} from 'figma-ui';
import {ScreenWarning} from 'interface/base/ScreenWarning';
import {F2RN_EDITOR_NS} from 'config/consts';
import MonacoReact from 'monacopilot';

import * as $ from 'interface/store';

import type {Theme} from 'monacopilot';
import type {UserSettings} from 'types/settings';

interface ComponentStoryProps {
  compKey: string;
  editorOptions: UserSettings['monaco']['general'];
  editorTheme: Theme;
}

export function ComponentStory(props: ComponentStoryProps) {
  const component = $.components.get(props.compKey);
  const story = $.getComponentStory(props.compKey);
  return (
    <Fragment>
      {!story &&
        <ScreenWarning message="Component not found"/>
      }
      <MonacoReact
        language="typescript"
        path={`${F2RN_EDITOR_NS}${component?.path}.story.ts`}
        value={story}
        theme={props.editorTheme}
        options={{...props.editorOptions, readOnly: true}}
        loading={<LoadingIndicator/>}
      />
    </Fragment>
  );
}
