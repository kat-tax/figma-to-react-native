import {h, Fragment} from 'preact';
import {LoadingIndicator} from '@create-figma-plugin/ui';
import MonacoReact from '@monaco-editor/react';
import {MonacoBinding} from 'interface/utils/code/lib/yjs';
import {F2RN_EDITOR_NS} from 'config/env';
import * as $ from 'interface/store';

import type {Settings} from 'types/settings';

interface ProjectThemeProps {
  options: Settings['monaco']['general'];
}

export function ProjectTheme(props: ProjectThemeProps) {
  return (
    <Fragment>
      {/* @ts-ignore Preact issue */}
      <MonacoReact
        language="typescript"
        path={`${F2RN_EDITOR_NS}theme.ts`}
        theme={props.options.theme}
        options={{...props.options, readOnly: true}}
        loading={<LoadingIndicator/> as JSX.Element}
        onMount={(editor) => {
          new MonacoBinding(
            $.getProjectTheme(),
            editor.getModel(),
            new Set([editor]),
            $.provider.awareness,
          );
        }}
      />
    </Fragment>
  );
}
