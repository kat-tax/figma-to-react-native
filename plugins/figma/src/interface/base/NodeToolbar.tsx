import {useState, Fragment} from 'react';
import {Toolbar, ToolbarButton} from '@blocknote/react';
import {emit} from '@create-figma-plugin/utilities';

import type {EventFocusNode} from 'types/events';

interface NodeToolbarProps {
  id: string,
}

enum NodeToolbarActions {
  Focus,
  Motions,
  Breakpoints,
  Interactions,
};

export function NodeToolbar(props: NodeToolbarProps) {
  const [active, setActive] = useState<NodeToolbarActions | null>(null);

  const getTitle = (action: NodeToolbarActions) => {
    switch (action) {
      case NodeToolbarActions.Focus:
        return 'Focus in Figma';
      case NodeToolbarActions.Motions:
        return 'Manage Animations';
      case NodeToolbarActions.Breakpoints:
        return 'Manage Breakpoints';
      case NodeToolbarActions.Interactions:
        return 'Manage Interactions';
    }
  };

  const getTrigger = (action: NodeToolbarActions) => {
    console.log(props.id, action);
    setActive(action);
    switch (action) {
      case NodeToolbarActions.Focus:
        emit<EventFocusNode>('FOCUS', props.id);
        break;
      case NodeToolbarActions.Motions:
        break;
      case NodeToolbarActions.Breakpoints:
        break;
      case NodeToolbarActions.Interactions:
        break;
    }
  };

  return (
    <Fragment>
      <Toolbar>
        {Object.entries(NodeToolbarActions)
        .map(([name, action]: [string, NodeToolbarActions]) => {
          return (
            <ToolbarButton
              key={action}
              isSelected={active === action}
              mainTooltip={getTitle(action)}
              onClick={() => getTrigger(action)}>
              {name}
            </ToolbarButton>
          )
        })}
      </Toolbar>
    </Fragment>
  );
}
