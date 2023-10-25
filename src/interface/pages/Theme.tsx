import MonacoReact from '@monaco-editor/react';

import {h} from 'preact';
import {LoadingIndicator} from '@create-figma-plugin/ui';
import {usePreviewTheme} from 'interface/hooks/usePreviewTheme';

import type {Settings} from 'types/settings';

interface ThemeProps {
  options: Settings['monaco']['general'];
}

export function Theme(props: ThemeProps) {
  const theme = usePreviewTheme();
  return (
    <MonacoReact
      language="typescript"
      path="Theme.ts"
      value={theme}
      theme={props.options.theme}
      options={{...props.options, readOnly: true}}
      loading={<LoadingIndicator/> as JSX.Element}
    />
  );
}
