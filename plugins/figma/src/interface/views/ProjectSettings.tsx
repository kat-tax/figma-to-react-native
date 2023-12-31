import {useMemo, Fragment} from 'react';
import {LoadingIndicator} from 'figma-ui';
import {F2RN_EDITOR_NS} from 'config/env';
import {debounce} from 'common/delay';
import MonacoReact from '@monaco-editor/react';

import type {Settings} from 'types/settings';
import type {ConfigData} from 'interface/hooks/useUserSettings';

const _path = `${F2RN_EDITOR_NS}settings.json`;

interface ProjectSettingsProps {
  settings: ConfigData;
  options: Settings['monaco']['general'];
  monaco: any;
}

export function ProjectSettings(props: ProjectSettingsProps) {
  const update = useMemo(() =>
    debounce(props.settings.update, 750), [props.settings.update]);
  return (
    <Fragment>
      <MonacoReact
        language="json"
        path={_path}
        value={props.settings.raw}
        theme={props.options.theme}
        options={{...props.options, readOnly: false}}
        loading={<LoadingIndicator/> as JSX.Element}
        onChange={value => update(value)}
        onValidate={markers => {
          if (markers.length === 0) {
            const uri = props.monaco.Uri.parse(_path);
            const model = props.monaco.editor.getModel(uri);
            props.settings.update(model.getValue(), true);
            props.settings.locked.current = false;
          } else {
            props.settings.locked.current = true;
          }
        }}
      />
    </Fragment>
  );
}
