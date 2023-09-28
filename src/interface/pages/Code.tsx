import {h, Fragment} from 'preact';
import {useRef, useEffect, useMemo} from 'preact/hooks';
import {memo} from 'preact/compat';
import {init} from 'vendor/monaco';
import {throttle} from 'common/delay';
import {Watermark} from 'interface/base/Watermark';
import {LoadingIndicator} from '@create-figma-plugin/ui';
import MonacoReact from '@monaco-editor/react';

import type {PreviewComponent} from 'types/preview';
import type {Settings} from 'types/settings';
import type {Monaco, Editor} from 'vendor/monaco';

interface CodeProps {
  component: PreviewComponent;
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
  };

  const update = useMemo(() => throttle(updateCode, 100), []);
  useEffect(() => update(props.component?.code || ''), [props?.component?.code]);

  return (
    <Fragment>
      {!props?.component?.code &&
        <Watermark/>
      }
      <MonacoReact
        language="typescript"
        path={`${props.component?.name}.tsx`}
        theme={props.options?.theme}
        options={{...props.options, readOnly: true}}
        loading={<LoadingIndicator/> as JSX.Element}
        onMount={(editor, monaco) => {
          init(editor, monaco);
          editorRef.current = editor;
        }}
      />
    </Fragment>
  );
}, (prev, next) => prev.component?.code === next.component?.code);








/*

EXPERIMENTAL CODE

import * as Diff from 'diff';

const diff = Diff.diffChars(curCode, newCode);
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
model.pushEditOperations([], editOperation, () => null);

*/