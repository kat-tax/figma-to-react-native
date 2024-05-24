import {Fragment} from 'react';
import {LoadingIndicator} from 'figma-ui';
import {ScreenWarning} from 'interface/base/ScreenWarning';
import {MonacoBinding} from 'interface/utils/editor/lib/MonacoBinding';
import {F2RN_EDITOR_NS} from 'config/env';
import MonacoReact from '@monaco-editor/react';

import * as $ from 'interface/store';

import type {UserSettings} from 'types/settings';

interface ComponentDocsProps {
  componentKey: string;
  options: UserSettings['monaco']['general'];
}

export function ComponentDocs(props: ComponentDocsProps) {
  const $componentInfo = $.components.get(props.componentKey);
  return (
    <Fragment>
      {!$componentInfo &&
        <ScreenWarning message="Component not found"/>
      }
      <MonacoReact
        language="mdx"
        path={`${F2RN_EDITOR_NS}${$componentInfo?.path}.docs.mdx`}
        theme={props.options?.theme}
        options={{...props.options}}
        loading={<LoadingIndicator/> as JSX.Element}
        onMount={(editor) => {
          new MonacoBinding(
            $.getComponentDocs(props.componentKey),
            editor.getModel(),
            new Set([editor]),
            $.provider.awareness,
          );
        }}
      />
    </Fragment>
  );
}
