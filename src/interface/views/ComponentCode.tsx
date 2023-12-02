import MonacoReact from '@monaco-editor/react';
import {MonacoBinding} from 'y-monaco';
import {h, Fragment} from 'preact';
import {useRef, useEffect} from 'preact/hooks';
import {LoadingIndicator} from '@create-figma-plugin/ui';
import {Watermark} from 'interface/base/Watermark';
import {init} from 'interface/utils/editor';
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
  const $componentInfo = $.components.get(props.target);
  const $componentCode = $.getComponentCode(props.target);
  const constraint = useRef<any>(null);
  const editor = useRef<Editor>(null);

  // Update component dependencies on new build
  /*useEffect(() => {
    if (props.build && editor.current) {
      Object.values(props.build.roster).forEach((data) => {
        if (!data.key) return;
        const code = $.getComponentCode(data.key);
        const uri = `figma://model/${data.name}.tsx`;
        const path = props.monaco.Uri.parse(uri);
        const model = props.monaco.editor.getModel(path);
        if (!model) {
          props.monaco.editor.createModel(code.toString(), 'typescript', path);
        } else {
          model.setValue(code.toString());
        }
      });
    }
  }, [props.build]);*/

  // Update editor constraints on target change
  /*useEffect(() => {
    if (constraint.current) {
      const model = editor.current?.getModel();
      console.log('update constraints', model);
      constraint.current?.removeRestrictionsIn(model);
      constraint.current?.addRestrictionsTo(model, [
        {
          label: 'start',
          range: [1, 1, 1, 1],
          allowMultiline: true,
        },
      ]);
    }
  }, [props.target]);*/

  return (
    <Fragment key={props.target}>
      {!$componentInfo && <Watermark/>}
      {/* @ts-ignore Preact issue */}
      <MonacoReact
        language="typescript"
        path={`figma://model/${$componentInfo?.name}.tsx`}
        theme={props.options?.theme}
        options={{...props.options}}
        loading={<LoadingIndicator/> as JSX.Element}
        onMount={(_editor, _monaco) => {
          editor.current = _editor;
          constraint.current = init(_editor, _monaco);
          new MonacoBinding(
            $componentCode,
            _editor.getModel(),
            new Set([_editor]),
            $.provider.awareness,
          )
        }}
      />
    </Fragment>
  );
}
