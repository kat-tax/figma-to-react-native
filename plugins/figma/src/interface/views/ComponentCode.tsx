import {emit} from '@create-figma-plugin/utilities';
import {LoadingIndicator} from 'figma-ui';
import {useRef, useState, useEffect, useCallback, Fragment} from 'react';
import MonacoReact, {DiffEditor} from '@monaco-editor/react';
import {Position} from 'monaco-editor';
import {F2RN_EDITOR_NS} from 'config/consts';
import {initComponentEditor, toolbarEvents, NodeToolbarState} from 'interface/utils/editor';
import {ScreenWarning} from 'interface/base/ScreenWarning';
import {MonacoBinding} from 'interface/utils/editor/lib/sync';
import {NodeToolbar} from 'interface/node/NodeToolbar';
import {useGit} from 'interface/providers/Git';
import * as diff from 'interface/utils/editor/lib/diff';
import * as $ from 'store';

import type {Theme} from '@monaco-editor/react';
import type {UserSettings} from 'types/settings';
import type {EventPropsSave} from 'types/events';
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
  showDiff: boolean,
  setShowDiff: (show: boolean) => void,
}

export function ComponentCode(props: ComponentCodeProps) {
  const editor = useRef<Editor>(null);
  const {fs} = useGit();
  const [toolbarState, setToolbarState] = useState<NodeToolbarState | null>(null);
  const [componentPath, setComponentPath] = useState<string>();
  const [comparePath, setComparePath] = useState<string>();
  const [patch, setPatch] = useState<string>('');
  const [snap, setSnap] = useState<string>('');
  const [head, setHead] = useState<string>('');

  const $info = $.components.get(props.compKey);
  const $code = $.component.code(props.compKey);

  // Autocomplete triggered by user
  const prompt = useCallback(async () => {
    const response = await fetch('http://localhost:8000', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: $code.toString(),
        image: props.build.roster[props.compKey].preview,
      }),
    });
    const output = await response.text();
    setPatch(output); // TODO
    props.setShowDiff(true);
  }, [$code, props.build, props.compKey]);

  // Node toolbar state changes
  useEffect(() => toolbarEvents.subscribe(setToolbarState), []);

  // Update component path when info changes
  useEffect(() => {
    if ($info) {
      setComponentPath(`${F2RN_EDITOR_NS}${$info.path.split('/').slice(1).join('/')}.tsx`);
      setComparePath(`${F2RN_EDITOR_NS}compare/${$info.path.split('/').slice(1).join('/')}.tsx`);
      setSnap($code.get().toString());
      try {
        const path = `design/${$info.path}/${$info.name}.tsx`;
        setHead(fs.readFileSync(path, 'utf8')?.toString());
      } catch (e) {
        setHead($code.get().toString());
      }
    }
  }, [$info, $code, fs]);

  // Update component dependencies on new build
  useEffect(() => {
    if (props.build) {
      for (const [key, component] of Object.entries(props.build.roster)) {
        if (!component.path || component.hasError) continue;
        const uri = `${F2RN_EDITOR_NS}${component.path.split('/').slice(1).join('/')}.tsx`;
        const path = props.monaco.Uri.parse(uri);
        const model = props.monaco.editor.getModel(path);
        if (!model) {
          props.monaco.editor.createModel(
            $.component.code(key).get().toString(),
            'typescript',
            path,
          );
        }
      }
    }
  }, [props.build, props.monaco]);

  // Consume code focus from navigation
  useEffect(() => {
    if (props.nav.codeFocus) {
      const {line, column} = props.nav.codeFocus || {};
      const pos = new Position(line, column).toJSON();
      if (Position.isIPosition(pos)) {
        // console.log('[code focus]', pos);
        props.nav.setCodeFocus(null);
        props.nav.setCursorPos({line, column});
        // editor.current?.focus();
        editor.current?.setPosition(pos);
        editor.current?.revealPositionInCenter(pos, 0);
      }
    }
  }, [props.nav.codeFocus, props.nav.setCodeFocus, props.nav.setCursorPos]);

  return (
    <Fragment>
      {!$info && 
        <ScreenWarning message="Component not found"/>
      }
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {!props.showDiff && <MonacoReact
          language="typescript"
          theme={props.editorTheme}
          options={{...props.editorOptions}}
          loading={<LoadingIndicator/>}
          path={componentPath}
          onMount={(e, m) => {
            editor.current = e;
            initComponentEditor(
              e, m,
              () => props.setShowDiff(!props.showDiff),
              prompt,
              (components) => {
                if (!components) return;
                emit<EventPropsSave>('PROPS_SAVE', Object.fromEntries(components));
              },
            );
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
              // console.log('[changed model content]', event);
              props.nav.setLastEditorRev(event.versionId);
            });
            e.onDidChangeModel((_event) => {
              // console.log('[changed model]', event);
              props.nav.setCursorPos(null);
              e.focus();
            });
            new MonacoBinding(
              $.provider?.awareness,
              $code.get(),
              e.getModel(),
              new Set([e]),
            );
          }}
        />}
        {props.showDiff && <DiffEditor
          language="typescript"
          theme={props.editorTheme}
          options={{...props.editorOptions, readOnly: true}}
          loading={<LoadingIndicator/>}
          original={head}
          modified={snap}
          modifiedModelPath={componentPath}
          originalModelPath={comparePath}
          keepCurrentModifiedModel={true}
          keepCurrentOriginalModel={false}
          onMount={(e) => {
            const editor = e.getModifiedEditor();
            diff.exit(editor, props.monaco, () => {
              props.setShowDiff(false);
            });
          }}
        />}
        {toolbarState && (
          <NodeToolbar
            node={toolbarState.nodeId}
            nodeSrc={toolbarState.nodeName}
            close={() => toolbarEvents.emit(null)}
            className="editor-node-toolbar"
            style={{
              top: toolbarState.position.top,
              left: toolbarState.position.left,
            }}
          />
        )}
      </div>
    </Fragment>
  );
}
