import MonacoReact from '@monaco-editor/react';

import {h, Fragment} from 'preact';
import {LoadingIndicator} from '@create-figma-plugin/ui';
import {Watermark} from 'interface/base/Watermark';

import type {PreviewComponent} from 'types/preview';
import type {Settings} from 'types/settings';

interface StoryProps {
  component: PreviewComponent;
  options: Settings['monaco']['general'];
}

export function Story(props: StoryProps) {
  return (
    <Fragment>
      {!props.component?.story &&
        <Watermark/>
      }
      {/* @ts-ignore Preact issue */}
      <MonacoReact
        language="typescript"
        path={`figma://model/${props.component?.name}.story.ts`}
        value={props.component?.story}
        theme={props.options?.theme}
        options={{...props.options, readOnly: true}}
        loading={<LoadingIndicator/> as JSX.Element}
      />
    </Fragment>
  );
}
