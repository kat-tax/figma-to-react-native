import {h} from 'preact';
import Editor from '@monaco-editor/react';
import {Loading} from 'interface/base/Loading';
import {useTheme} from 'interface/hooks/useTheme';

import type {Settings} from 'types/settings';

interface ThemeProps {
  options: Settings['monaco']['general'];
  monaco: any;
}

export function Theme(props: ThemeProps) {
  const theme = useTheme();
  return (
    <div>
      <Editor
        language="typescript"
        path="Theme.ts"
        value={theme}
        theme={props.options.theme}
        options={{...props.options, readOnly: true}}
        loading={<Loading/> as JSX.Element}
      />
    </div>
  );
}
