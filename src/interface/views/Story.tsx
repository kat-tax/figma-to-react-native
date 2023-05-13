import {h, Fragment} from 'preact';
import Editor from '@monaco-editor/react';
import {Hint} from 'interface/base/Hint';
import {Loading} from 'interface/base/Loading';

import type {EditorComponent} from 'types/editor';
import type {Settings} from 'types/settings';

interface StoryProps {
  component: EditorComponent;
  options: Settings['monaco']['general'];
}

export function Story(props: StoryProps) {
  return (
    <Fragment>
      {!props.component?.story && <Hint/>}
      <Editor
        language="typescript"
        path={`${props.component?.name}.story.ts`}
        value={props.component?.story}
        theme={props.options?.theme}
        options={{...props.options, readOnly: true}}
        loading={<Loading/> as JSX.Element}
      />
    </Fragment>
  );
}
