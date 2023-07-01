import {memo} from 'preact/compat';
import {h, Fragment} from 'preact';
import {useRef, useEffect, useMemo} from 'preact/hooks';
import {throttle} from 'common/delay';
import MonacoReact from '@monaco-editor/react';
// import * as Diff from 'diff';

import {Hint} from 'interface/base/Hint';
import {initEditor} from 'common/monaco';

import {Loading} from 'interface/base/Loading';

import type {EditorComponent} from 'types/editor';
import type {Settings} from 'types/settings';
import type {Monaco, Editor} from 'common/monaco';

interface CodeProps {
  component: EditorComponent;
  options: Settings['monaco']['general'];
  monaco: Monaco;
}

export const Code = memo((props: CodeProps) => {
  const editorRef = useRef<Editor>(null);
  const updateCode = (newCode: string) => {
    const model = editorRef.current?.getModel();
    if (!model) return;
    const curCode = model.getValue();
    if (curCode === newCode) return;
    model.setValue(newCode);
    /*const diff = Diff.diffChars(curCode, newCode);
    // Apply the changes to the model's content
    let currentPosition = 0;
    const editOperation = diff.map(part => {
      const partLength = part.value.length;
      const startPosition = model.getPositionAt(currentPosition);
      const endPosition = model.getPositionAt(currentPosition + partLength);
      currentPosition += partLength;
      return {
        range: new props.monaco.Range(
          startPosition.lineNumber,
          startPosition.column,
          endPosition.lineNumber,
          endPosition.column
        ),
        text: part.value
      };
    });
    // Apply the edit operation to the model's content
    model.pushEditOperations([], editOperation, () => null);*/
  };

  const update = useMemo(() => throttle(updateCode, 100), []);
  useEffect(() => update(props.component?.code || ''), [props?.component?.code]);

  return (
    <Fragment>
      {!props?.component?.code && <Hint/>}
      <MonacoReact
        language="typescript"
        path={`${props.component?.name}.tsx`}
        theme={props.options?.theme}
        options={{...props.options, readOnly: true}}
        loading={<Loading/> as JSX.Element}
        onMount={(editor, monaco) => {
          initEditor(editor, monaco);
          editorRef.current = editor;
        }}
      />
    </Fragment>
  );
}, (prev, next) => prev.component?.code === next.component?.code);
