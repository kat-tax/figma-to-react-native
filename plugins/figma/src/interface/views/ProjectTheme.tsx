import MonacoReact from '@monaco-editor/react';
import {Fragment} from 'react';
import {LoadingIndicator} from 'figma-ui';
import {MonacoBinding} from 'interface/utils/editor/lib/yjs';
import {ThemePicker} from 'interface/base/ThemePicker';
import {F2RN_EDITOR_NS} from 'config/env';

import * as $ from 'interface/store';

import type {UserSettings} from 'types/settings';

interface ProjectThemeProps {
  options: UserSettings['monaco']['general'],
  hasStyles: boolean,
}

export function ProjectTheme(props: ProjectThemeProps) {
  return props.hasStyles
    ? <Fragment>
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
    : <ThemePicker/>;
}
