import {h} from 'preact';
import Editor from '@monaco-editor/react';
import {useMemo} from 'preact/hooks';
import {debounce} from 'common/delay';
import {Loading} from 'interface/base/Loading';

import type {Settings} from 'types/settings';
import type {SettingsData} from 'interface/hooks/useSettings';

interface SettingsProps {
  settings: SettingsData;
  options: Settings['monaco']['general'];
  monaco: any;
}

export function Settings(props: SettingsProps) {
  const update = useMemo(() =>
    debounce(props.settings.update, 750), [props.settings.update]);
  return (
    <Editor
      language="json"
      path="Settings.json"
      value={props.settings.raw}
      theme={props.options.theme}
      options={{...props.options, readOnly: false}}
      loading={<Loading/> as JSX.Element}
      onChange={value => update(value)}
      onValidate={markers => {
        if (markers.length === 0) {
          const uri = props.monaco.Uri.parse('Settings.json');
          const model = props.monaco.editor.getModel(uri);
          props.settings.update(model.getValue(), true);
          props.settings.locked.current = false;
        } else {
          props.settings.locked.current = true;
        }
      }}
    />
  );
}
