import {h, Fragment} from 'preact';
import {LoadingIndicator} from '@create-figma-plugin/ui';
import MonacoReact from '@monaco-editor/react';
import {Watermark} from 'interface/base/Watermark';
import * as $ from 'interface/store';

import type {Settings} from 'types/settings';

interface ComponentStoryProps {
  target: string;
  options: Settings['monaco']['general'];
}

export function ComponentStory(props: ComponentStoryProps) {
  const component = $.components.get(props.target);
  const story = $.getComponentStory(props.target);
  return (
    <Fragment>
      {!story &&
        <Watermark/>
      }
      {/* @ts-ignore Preact issue */}
      <MonacoReact
        language="typescript"
        path={`figma://preview/${component?.name}.story.ts`}
        value={story}
        theme={props.options?.theme}
        options={{...props.options, readOnly: true}}
        loading={<LoadingIndicator/> as JSX.Element}
      />
    </Fragment>
  );
}
