import MonacoReact from '@monaco-editor/react';

import {h, Fragment} from 'preact';
import {memo} from 'preact/compat';
import {useRef, useEffect, useMemo} from 'preact/hooks';
import {LoadingIndicator} from '@create-figma-plugin/ui';
import {Watermark} from 'interface/base/Watermark';
import {throttle} from 'common/delay';
import {init} from 'interface/utils/editor';

import type {Monaco, Editor} from 'interface/utils/editor';
import type {PreviewComponent} from 'types/preview';
import type {Settings} from 'types/settings';

interface CodeProps {
  component: PreviewComponent;
  options: Settings['monaco']['general'];
  monaco: Monaco;
}

export const Code = memo((props: CodeProps) => {
  const constraintRef = useRef<any>(null);
  const editorRef = useRef<Editor>(null);

  const updateCode = (newCode: string) => {
    const model = editorRef.current?.getModel();
    if (!model) return;
    const curCode = model.getValue();
    if (curCode === newCode) return;

    // Update editor content
    model.setValue(newCode);

    // TODO: Add editing restraints
    constraintRef.current.removeRestrictionsIn(model);
    constraintRef.current.addRestrictionsTo(model, [
      /*{
        label: 'util',
        range: [1, 7, 1, 12], // [startLine, startColumn, endLine, endColumn]
        validate: (val: string, range: any, info: any) => /^[a-z0-9A-Z]*$/.test(val),
      },*/
      {
        label: 'func',
        range: [1, 1, 1, 10],
        allowMultiline: false,
      },
    ]);
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
          editorRef.current = editor;
          constraintRef.current = init(editor, monaco);
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