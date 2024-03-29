import {useRef, useState, useEffect, useCallback, Fragment} from 'react';
import MonacoReact, {DiffEditor} from '@monaco-editor/react';
import {LoadingIndicator} from 'figma-ui';
import {ScreenWarning} from 'interface/base/ScreenWarning';
import {MonacoBinding} from 'interface/utils/editor/lib/MonacoBinding';
import {initComponentEditor} from 'interface/utils/editor';
import {F2RN_EDITOR_NS} from 'config/env';
import * as $ from 'interface/store';

import type {Monaco, Editor} from 'interface/utils/editor';
import type {ComponentBuild} from 'types/component';
import type {UserSettings} from 'types/settings';

interface ComponentCodeProps {
  componentKey: string,
  build: ComponentBuild,
  options: UserSettings['monaco']['general'],
  monaco: Monaco,
}

export function ComponentCode(props: ComponentCodeProps) {
  const [patch, setPatch] = useState<string>('');
  const constraint = useRef<any>(null);
  const editor = useRef<Editor>(null);

  const $componentInfo = $.components.get(props.componentKey);
  const $componentCode = $.getComponentCode(props.componentKey);

  // GPT triggered by user
  const handleGPT = useCallback(async () => {
    const response = await fetch('http://localhost:8000', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: $componentCode.toString(),
        image: props.build.roster[props.componentKey].preview,
      }),
    });
    const output = await response.text();
    setPatch(output);
  }, [$componentCode, props.build]);

  // Update component dependencies on new build
  useEffect(() => {
    if (props.build) {
      Object.entries(props.build.roster).forEach(([key, component]) => {
        const code = $.getComponentCode(key);
        const uri = `${F2RN_EDITOR_NS}${component.name}.tsx`;
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
    <Fragment>
      {!$componentInfo && 
        <ScreenWarning message="Component not found"/>
      }
      {!patch && <MonacoReact
        language="typescript"
        theme={props.options?.theme}
        options={{...props.options}}
        loading={<LoadingIndicator/> as JSX.Element}
        path={`${F2RN_EDITOR_NS}${$componentInfo?.name}.tsx`}
        onMount={(e, m) => {
          editor.current = e;
          constraint.current = initComponentEditor(e, m, handleGPT);
          new MonacoBinding(
            $componentCode,
            e.getModel(),
            new Set([e]),
            $.provider.awareness,
          );
        }}
      />}
      {patch && <DiffEditor
        language="typescript"
        theme={props.options?.theme}
        options={{...props.options}}
        loading={<LoadingIndicator/> as JSX.Element}
        original={$componentCode.toString()}
        modified={patch}
        originalModelPath={`${F2RN_EDITOR_NS}${$componentInfo?.name}.tsx`}
        modifiedModelPath={`${F2RN_EDITOR_NS}patch/${$componentInfo?.name}.tsx`}
        keepCurrentOriginalModel={true}
        keepCurrentModifiedModel={false}
      />}
    </Fragment>
  );
}
