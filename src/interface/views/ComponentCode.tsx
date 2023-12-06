import {h, Fragment} from 'preact';
import {useRef, useEffect} from 'preact/hooks';
import MonacoReact from '@monaco-editor/react';
import {LoadingIndicator} from '@create-figma-plugin/ui';
import {F2RN_EDITOR_NS} from 'config/env';
import {Watermark} from 'interface/base/Watermark';
import {MonacoBinding} from 'interface/utils/editor/yjs';
import {setupComponentEditor} from 'interface/utils/editor/setup';
import * as $ from 'interface/store';

import type {Monaco, Editor} from 'interface/utils/editor/setup';
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
  useEffect(() => {
    if (props.build) {
      Object.keys(props.build.roster).forEach(name => {
        const code = $.getComponentCode(name);
        const uri = `${F2RN_EDITOR_NS}${name}.tsx`;
        const path = props.monaco.Uri.parse(uri);
        const model = props.monaco.editor.getModel(path);
        if (!model) {
          props.monaco.editor.createModel(code.toString(), 'typescript', path);
        } else {
          model.setValue(code.toString());
        }
      });
    }
  }, [props.build]);

  // Update editor constraints on target change
  /*useEffect(() => {
    if (constraint.current) {
      const model = editor.current?.getModel();
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
        path={`${F2RN_EDITOR_NS}${$componentInfo?.name}.tsx`}
        theme={props.options?.theme}
        options={{...props.options}}
        loading={<LoadingIndicator/> as JSX.Element}
        onMount={(e, m) => {
          editor.current = e;
          constraint.current = setupComponentEditor(e, m);
          new MonacoBinding(
            $componentCode,
            e.getModel(),
            new Set([e]),
            $.provider.awareness,
          );
        }}
      />
    </Fragment>
  );
}
