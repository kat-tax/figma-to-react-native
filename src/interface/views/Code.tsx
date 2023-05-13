import {h, Fragment} from 'preact';
import Editor from '@monaco-editor/react';
import {Hint} from 'interface/base/Hint';
import {Loading} from 'interface/base/Loading';

import type {EditorComponent} from 'types/editor';
import type {Settings} from 'types/settings';

interface CodeProps {
  component: EditorComponent;
  options: Settings['monaco']['general'];
  monaco: any;
}

export function Code(props: CodeProps) {
  return (
    <Fragment>
      {!props.component?.code && <Hint/>}
      <Editor
        language="typescript"
        path={`${props.component?.name}.tsx`}
        value={props.component?.code}
        theme={props.options?.theme}
        options={{...props.options, readOnly: true}}
        loading={<Loading/> as JSX.Element}
      />
    </Fragment>
  );
}
