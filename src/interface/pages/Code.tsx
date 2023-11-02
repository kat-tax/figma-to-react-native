import MonacoReact from '@monaco-editor/react';

import {h, Fragment} from 'preact';
import {memo} from 'preact/compat';
import {useRef, useEffect, useMemo} from 'preact/hooks';
import {LoadingIndicator} from '@create-figma-plugin/ui';
import {Watermark} from 'interface/base/Watermark';
import {init} from 'interface/utils/editor';
import {throttle} from 'common/delay';

import type {Monaco, Editor} from 'interface/utils/editor';
import type {Components} from 'interface/hooks/useComponents';
import type {Settings} from 'types/settings';
import type {PreviewComponent} from 'types/preview';

interface CodeProps {
  component: PreviewComponent;
  components: Components;
  options: Settings['monaco']['general'];
  monaco: Monaco;
}

export const Code = memo((props: CodeProps) => {
  const constraint = useRef<any>(null);
  const editor = useRef<Editor>(null);

  const updateCode = (newCode: string) => {
    const model = editor.current?.getModel();
    if (!model) return;
    const curCode = model.getValue();
    if (curCode === newCode) return;

    if (props.components) {
      Object.keys(props.components.data).forEach((name) => {
        const path = props.monaco.Uri.parse(`figma://model/${name}.tsx`);
        const model = props.monaco.editor.getModel(path);
        if (!model) {
          props.monaco.editor.createModel(
            props.components.data[name].code,
            'typescript',
            path,
          );
        } else {
          model.setValue(props.components.data[name].code);
        }
      });
    }

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

  const update = useMemo(() => throttle(updateCode, 100), [props.components]);
  useEffect(() => update(props.component?.code || ''), [props?.component?.code]);

  return (
    <Fragment>
      {!props?.component?.code &&
        <Watermark/>
      }
      {/* @ts-ignore Preact issue */}
      <MonacoReact
        language="typescript"
        path={`figma://model/${props.component?.name}.tsx`}
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
}, (prev, next) => prev.component?.code === next.component?.code);
