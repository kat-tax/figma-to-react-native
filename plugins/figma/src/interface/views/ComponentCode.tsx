import {useRef, useState, useEffect, useCallback, Fragment} from 'react';
import MonacoReact, {DiffEditor} from '@monaco-editor/react';
import {Position} from 'monaco-editor';
import {LoadingIndicator} from 'figma-ui';
import {ScreenWarning} from 'interface/base/ScreenWarning';
import {MonacoBinding} from 'interface/utils/editor/lib/MonacoBinding';
import {initComponentEditor} from 'interface/utils/editor';
import {F2RN_EDITOR_NS} from 'config/consts';
import * as $ from 'interface/store';

import type {UserSettings} from 'types/settings';
import type {ComponentBuild} from 'types/component';
import type {Monaco, Editor} from 'interface/utils/editor';
import type {Navigation} from 'interface/hooks/useNavigation';

interface ComponentCodeProps {
  componentKey: string,
  build: ComponentBuild,
  options: UserSettings['monaco']['general'],
  monaco: Monaco,
  nav: Navigation,
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
        const uri = `${F2RN_EDITOR_NS}${component.path.split('/').slice(1).join('/')}.tsx`;
        const path = props.monaco.Uri.parse(uri);
        const model = props.monaco.editor.getModel(path);
        if (!model) {
          props.monaco.editor.createModel(code.toString(), 'typescript', path);
        }
      });
    }
  }, [props.build]);

  // Consume code focus from navigation
  useEffect(() => {
    if (props.nav.codeFocus) {
      const {line, column} = props.nav.codeFocus || {};
      const pos = new Position(line, column).toJSON();
      if (Position.isIPosition(pos)) {
        console.log('[code focus]', pos);
        props.nav.setCodeFocus(null);
        props.nav.setCursorPos({line, column});
        editor.current?.focus();
        editor.current?.setPosition(pos);
        editor.current?.revealPositionInCenter(pos, 0);
      }
    }
  }, [props.nav.codeFocus]);

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
        loading={<LoadingIndicator/>}
        path={`${F2RN_EDITOR_NS}${$componentInfo?.path.split('/').slice(1).join('/')}.tsx`}
        onMount={(e, m) => {
          editor.current = e;
          constraint.current = initComponentEditor(e, m, handleGPT);
          e.onDidChangeCursorPosition((event) => {
            console.log('[changed cursor]', event);
            if (props.nav.codeFocus) return;
            if ((event?.source === 'mouse'
              || event?.source === 'restoreState')) {
              props.nav.setCursorPos({
                line: event.position.lineNumber,
                column: event.position.column,
              });
            }
          });
          e.onDidChangeModel((event) => {
            console.log('[changed model]', event);
            props.nav.setCursorPos(null);
            e.focus();
          });
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
        loading={<LoadingIndicator/>}
        original={$componentCode.toString()}
        modified={patch}
        originalModelPath={`${F2RN_EDITOR_NS}${$componentInfo?.path.split('/').slice(1).join('/')}.tsx`}
        modifiedModelPath={`${F2RN_EDITOR_NS}patch/${$componentInfo?.path}.tsx`}
        keepCurrentOriginalModel={true}
        keepCurrentModifiedModel={false}
      />}
    </Fragment>
  );
}
