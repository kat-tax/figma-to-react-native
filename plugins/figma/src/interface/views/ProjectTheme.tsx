import MonacoReact from '@monaco-editor/react';
import {Fragment} from 'react';
import {LoadingIndicator} from 'figma-ui';
import {MonacoBinding} from 'interface/utils/editor/lib/sync';
import {ThemePicker} from 'interface/base/ThemePicker';
import {F2RN_EDITOR_NS} from 'config/consts';
import * as $ from 'store';

import type {Theme} from '@monaco-editor/react';
import type {UserSettings} from 'types/settings';

interface ProjectThemeProps {
  editorOptions: UserSettings['monaco']['general'],
  editorTheme: Theme,
  hasStyles: boolean,
}

export function ProjectTheme(props: ProjectThemeProps) {
  return props.hasStyles
    ? <Fragment>
        <MonacoReact
          language="typescript"
          path={`${F2RN_EDITOR_NS}theme.ts`}
          theme={props.editorTheme}
          options={{...props.editorOptions, readOnly: true}}
          loading={<LoadingIndicator/>}
          onMount={(editor) => {
            new MonacoBinding(
              $.provider?.awareness,
              $.projectTheme.get(),
              editor.getModel(),
              new Set([editor]),
            );
          }}
        />
      </Fragment>
    : <ThemePicker/>;
}
