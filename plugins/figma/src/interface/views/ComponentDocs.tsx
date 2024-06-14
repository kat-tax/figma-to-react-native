import {Fragment} from 'react';
import {LoadingIndicator} from 'figma-ui';
import {ScreenWarning} from 'interface/base/ScreenWarning';
import {F2RN_EDITOR_NS} from 'config/consts';
import MonacoReact from '@monaco-editor/react';

import * as $ from 'interface/store';

import type {UserSettings} from 'types/settings';

interface ComponentDocsProps {
  componentKey: string;
  options: UserSettings['monaco']['general'];
}

export function ComponentDocs(props: ComponentDocsProps) {
  const $componentInfo = $.components.get(props.componentKey);
  const docs = $.getComponentDocs(props.componentKey);
  return (
    <Fragment>
      {!$componentInfo &&
        <ScreenWarning message="Component not found"/>
      }
      <MonacoReact
        language="mdx"
        path={`${F2RN_EDITOR_NS}${$componentInfo?.path}.docs.mdx`}
        value={docs.toString()}
        theme={props.options?.theme}
        options={{...props.options, readOnly: true}}
        loading={<LoadingIndicator/>}
      />
    </Fragment>
  );
}
