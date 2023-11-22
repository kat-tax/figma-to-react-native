import MonacoReact from '@monaco-editor/react';
import {h, Fragment} from 'preact';
import {useRef, useState, useEffect, useMemo} from 'preact/hooks';
import {LoadingIndicator} from 'figma-ui';
import {Watermark} from 'interface/base/Watermark';
import {init} from 'interface/utils/editor';
import {throttle} from 'common/delay';
import * as $ from 'interface/store';

import type {Monaco, Editor} from 'interface/utils/editor';
import type {ComponentBuild} from 'types/component';
import type {Settings} from 'types/settings';

interface ComponentCodeProps {
  target: string,
  build: ComponentBuild,
  options: Settings['monaco']['general'],
  monaco: Monaco,
}

export function ComponentCode(props: ComponentCodeProps) {
  const [hasCode, setHasCode] = useState(false);
  const component = $.components.get(props.target);
  const constraint = useRef<any>(null);
  const editor = useRef<Editor>(null);

  const updateCode = (newCode: string) => {
    const model = editor.current?.getModel();
    if (!model) return;
    const curCode = model.getValue();
    if (curCode === newCode) return;

    /*if (props.build) {
      Object.values(props.build.roster).forEach((data) => {
        if (!data.component) return;
        const {code} = data.component;
        const uri = `figma://model/${data.name}.tsx`;
        const path = props.monaco.Uri.parse(uri);
        const model = props.monaco.editor.getModel(path);
        if (!model) {
          props.monaco.editor.createModel(code, 'typescript', path);
        } else {
          model.setValue(code);
        }
      });
    }*/

    // Update editor content
    model.setValue(newCode);

    // TODO: Add editing restraints
    constraint.current?.removeRestrictionsIn(model);
    constraint.current?.addRestrictionsTo(model, [
      /*{
        label: 'util',
        range: [1, 7, 1, 12], // [startLine, startColumn, endLine, endColumn]
        validate: (val: string, range: any, info: any) => /^[a-z0-9A-Z]*$/.test(val),
      },*/
      {
        label: 'start',
        range: [1, 1, 1, 1],
        allowMultiline: true,
      },
    ]);
  };

  const update = useMemo(() => throttle(updateCode, 100), [props.build]);

  useEffect(() => {
    if (!component) return;
    const code = $.getComponentCode(props.target);
    if (code) {
      update(code.toString());
      setHasCode(true);
    } else {
      setHasCode(false);
    }
  }, [component]);

  return (
    <Fragment>
      {!hasCode &&
        <Watermark/>
      }
      {/* @ts-ignore Preact issue */}
      <MonacoReact
        language="typescript"
        path={`figma://model/${component?.name}.tsx`}
        theme={props.options?.theme}
        options={{...props.options, readOnly: false}}
        loading={<LoadingIndicator/> as JSX.Element}
        onMount={(_editor, _monaco) => {
          editor.current = _editor;
          constraint.current = init(_editor, _monaco);
        }}
      />
    </Fragment>
  );
}
