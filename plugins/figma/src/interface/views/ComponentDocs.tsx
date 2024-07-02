import {Fragment} from 'react';
import {LoadingIndicator} from 'figma-ui';
import {ScreenWarning} from 'interface/base/ScreenWarning';
import {F2RN_EDITOR_NS} from 'config/consts';
import MonacoReact from 'monacopilot';

import * as $ from 'interface/store';

import type {Theme} from 'monacopilot';
import type {UserSettings} from 'types/settings';

interface ComponentDocsProps {
  compKey: string;
  editorOptions: UserSettings['monaco']['general'];
  editorTheme: Theme;
}

export function ComponentDocs(props: ComponentDocsProps) {
  const $componentInfo = $.components.get(props.compKey);
  const docs = $.getComponentDocs(props.compKey);
  return (
    <Fragment>
      {!$componentInfo &&
        <ScreenWarning message="Component not found"/>
      }
      <MonacoReact
        language="mdx"
        path={`${F2RN_EDITOR_NS}${$componentInfo?.path}.docs.mdx`}
        value={docs.toString()}
        theme={props.editorTheme}
        options={{...props.editorOptions, readOnly: true}}
        loading={<LoadingIndicator/>}
      />
    </Fragment>
  );
}
