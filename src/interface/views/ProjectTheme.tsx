import {h, Fragment} from 'preact';
import {MonacoBinding} from 'y-monaco';
import {LoadingIndicator} from '@create-figma-plugin/ui';
import {F2RN_EDITOR_NS} from 'config/env';
import MonacoReact from '@monaco-editor/react';
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
