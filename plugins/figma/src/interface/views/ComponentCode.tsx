import {useRef, useState, useEffect, useCallback, Fragment} from 'react';
import MonacoReact, {DiffEditor} from 'monacopilot';
import {Position} from 'monaco-editor';
import {LoadingIndicator} from 'figma-ui';
import {ScreenWarning} from 'interface/base/ScreenWarning';
import {MonacoBinding} from 'interface/utils/editor/lib/MonacoBinding';
import {initComponentEditor} from 'interface/utils/editor';
import {F2RN_EDITOR_NS} from 'config/consts';
import * as $ from 'interface/store';

import type {Theme} from 'monacopilot';
import type {UserSettings} from 'types/settings';
import type {ComponentBuild} from 'types/component';
import type {Monaco, Editor} from 'interface/utils/editor';
import type {Navigation} from 'interface/hooks/useNavigation';

interface ComponentCodeProps {
  monaco: Monaco,
  compKey: string,
  nav: Navigation,
  build: ComponentBuild,
  editorOptions: UserSettings['monaco']['general'],
  editorTheme: Theme,
}

export function ComponentCode(props: ComponentCodeProps) {
  const [componentPath, setComponentPath] = useState<string>();
  const [patchPath, setPatchPath] = useState<string>();
  const [patch, setPatch] = useState<string>('');
  const constraint = useRef<any>(null);
  const editor = useRef<Editor>(null);

  const $componentInfo = $.components.get(props.compKey);
  const $componentCode = $.getComponentCode(props.compKey);

  // GPT triggered by user
  const handleGPT = useCallback(async () => {
    const response = await fetch('http://localhost:8000', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: $componentCode.toString(),
        image: props.build.roster[props.compKey].preview,
      }),
    });
    const output = await response.text();
    setPatch(output);
  }, [$componentCode, props.build]);

  // Update component path when info changes
  useEffect(() => {
    if ($componentInfo) {
      console.log('[component path]', $componentInfo.path);
      setComponentPath(`${F2RN_EDITOR_NS}${$componentInfo.path.split('/').slice(1).join('/')}.tsx`);
      setPatchPath(`${F2RN_EDITOR_NS}patch/${$componentInfo.path.split('/').slice(1).join('/')}.tsx`);
    }
  }, [$componentInfo]);

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
        // console.log('[code focus]', pos);
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
        theme={props.editorTheme}
        options={{...props.editorOptions}}
        loading={<LoadingIndicator/>}
        path={componentPath}
        onMount={(e, m) => {
          editor.current = e;
          constraint.current = initComponentEditor(e, m, handleGPT);
          e.onDidChangeCursorPosition((event) => {
            // console.log('[changed cursor]', event);
            if (props.nav.codeFocus) return;
            if ((event?.source === 'mouse'
              || event?.source === 'keyboard'
              || event?.source === 'restoreState')) {
              props.nav.setCursorPos({
                line: event.position.lineNumber,
                column: event.position.column,
              });
            }
          });
          e.onDidChangeModelContent((event) => {
            console.log('[changed model content]', event);
            props.nav.setLastEditorRev(event.versionId);
          });
          e.onDidChangeModel((_event) => {
            // console.log('[changed model]', event);
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
        theme={props.editorTheme}
        options={{...props.editorOptions}}
        loading={<LoadingIndicator/>}
        original={$componentCode.toString()}
        modified={patch}
        modifiedModelPath={patchPath}
        originalModelPath={componentPath}
        keepCurrentOriginalModel={true}
        keepCurrentModifiedModel={false}
      />}
    </Fragment>
  );
}
