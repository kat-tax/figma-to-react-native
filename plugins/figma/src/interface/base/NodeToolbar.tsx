import {h, Fragment} from 'preact';
import {emit} from '@create-figma-plugin/utilities';
import {Toolbar, ToolbarButton} from '@blocknote/react';

import type {EventFocusNode} from 'types/events';

interface NodeToolbarProps {
  id: string,
}

type NodeToolbarActions =
  | 'inspect'
  | 'motions'
  | 'breakpoints'
  | 'interactions'

export function NodeToolbar(props: NodeToolbarProps) {
  const select = (action: NodeToolbarActions) => {
    console.log(props.id, action);
    switch (action) {
      case 'inspect':
        emit<EventFocusNode>('FOCUS', props.id);
        break;
      case 'motions':
        break;
      case 'breakpoints':
        break;
      case 'interactions':
        break;
    }
  }

  return (
    <Fragment>
      {/* @ts-ignore Preact issue */}
      <Toolbar>
        {/* @ts-ignore Preact issue */}
        <ToolbarButton
          mainTooltip={"Inspect in Figma"}
          isSelected={false}
          onClick={() => select('inspect')}>
          Inspect
        </ToolbarButton>
      </Toolbar>
    </Fragment>
  );
}
