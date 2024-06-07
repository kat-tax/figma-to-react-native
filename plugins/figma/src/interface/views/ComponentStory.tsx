import {Fragment} from 'react';
import {LoadingIndicator} from 'figma-ui';
import {ScreenWarning} from 'interface/base/ScreenWarning';
import {F2RN_EDITOR_NS} from 'config/consts';
import MonacoReact from '@monaco-editor/react';

import * as $ from 'interface/store';

import type {UserSettings} from 'types/settings';

interface ComponentStoryProps {
  componentKey: string;
  options: UserSettings['monaco']['general'];
}

export function ComponentStory(props: ComponentStoryProps) {
  const component = $.components.get(props.componentKey);
  const story = $.getComponentStory(props.componentKey);
  return (
    <Fragment>
      {!story &&
        <ScreenWarning message="Component not found"/>
      }
      <MonacoReact
        language="typescript"
        path={`${F2RN_EDITOR_NS}${component?.path}.story.ts`}
        value={story}
        theme={props.options?.theme}
        options={{...props.options, readOnly: true}}
        loading={<LoadingIndicator/> as JSX.Element}
      />
    </Fragment>
  );
}
