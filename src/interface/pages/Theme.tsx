import MonacoReact from '@monaco-editor/react';

import {h, Fragment} from 'preact';
import {LoadingIndicator} from '@create-figma-plugin/ui';
import {usePreviewTheme} from 'interface/hooks/usePreviewTheme';

import type {Settings} from 'types/settings';

interface ThemeProps {
  options: Settings['monaco']['general'];
}

export function Theme(props: ThemeProps) {
  const theme = usePreviewTheme();
  return (
    <Fragment>
      {/* @ts-ignore Preact issue */}
      <MonacoReact
        language="typescript"
        path="figma://model/theme.ts"
        value={theme}
        theme={props.options.theme}
        options={{...props.options, readOnly: true}}
        loading={<LoadingIndicator/> as JSX.Element}
      />
    </Fragment>
  );
}
