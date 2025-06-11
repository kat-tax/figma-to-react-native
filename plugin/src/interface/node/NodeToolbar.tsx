import {on, emit} from '@create-figma-plugin/utilities';
import {IconButton} from 'figma-kit';
import {useEffect, useState} from 'react';
import {useForm} from 'interface/figma/hooks/use-form';
import {IconAdjust} from 'interface/figma/icons/24/Adjust';
import {IconAnimation} from 'interface/figma/icons/24/Animation';
import {IconEffects} from 'interface/figma/icons/32/Effects';
import {IconVisible} from 'interface/figma/icons/24/Visible';
import {IconCross} from 'interface/figma/icons/24/Cross';
import {IconList} from 'interface/figma/icons/32/List';
import {NodeAttrGroup} from 'types/node';
import {NodeGroup} from 'interface/node/NodeGroup';
import {diff} from 'deep-object-diff';

import type {NodeAttrData} from 'types/node';
import type {EventNodeAttrSave, EventNodeAttrReq, EventNodeAttrRes} from 'types/events';
import type {NodeGroupProps} from 'interface/node/NodeGroup';
import type {CSSProperties} from 'react';

export interface NodeToolbarProps {
  node: string,
  nodeSrc: string,
  close: () => void,
  style?: CSSProperties,
  className?: string,
}

const DISABLED_ATTRS: Array<NodeAttrGroup> = [
  NodeAttrGroup.Interactions,
  NodeAttrGroup.Dynamics,
];

export function NodeToolbar(props: NodeToolbarProps) {
  const {node, nodeSrc, close, style, className} = props;
  const [visible, setVisible] = useState(true);
  const [initial, setInitial] = useState<NodeAttrData | null>(null);

  const groups: Array<Omit<NodeGroupProps,
    | 'node'
    | 'nodeSrc'
    | 'visible'
    | 'state'
    | 'save'
    | 'close'
    | 'update'
    | 'setDialogOpen'>
  > = [
    {group: NodeAttrGroup.Props, icon: <IconAdjust/>},
    {group: NodeAttrGroup.Motions, icon: <IconAnimation/>},
    {group: NodeAttrGroup.Interactions, icon: <IconEffects/>},
    {group: NodeAttrGroup.Visibilities, icon: <IconVisible/>},
    {group: NodeAttrGroup.Dynamics, icon: <IconList/>},
  ];

  const form = useForm<NodeAttrData | null>(null, {
    close: () => {},
    submit: (data) => {
      if (!data) return;
      emit<EventNodeAttrSave>('NODE_ATTR_SAVE', node, data);
    },
  });

  // Handle node attributes response
  useEffect(() => on<EventNodeAttrRes>('NODE_ATTR_RES', (nodeId, data) => {
    if (nodeId === node) {
      // Store the initial data when it's first received
      if (!initial) {
        setInitial(data);
      }
      for (const [group, rules] of Object.entries(data)) {
        form.setFormState(rules, group as NodeAttrGroup);
      }
    }
  }), [node, initial]);

  // Request node attributes from backend
  useEffect(() => {
    emit<EventNodeAttrReq>('NODE_ATTR_REQ', node, nodeSrc);
    // Reset initial data when node changes
    setInitial(null);
  }, [node]);

  // Save form on update, but only if data has changed
  useEffect(() => {
    if (form.formState && initial) {
      // Check if the data has actually changed before submitting
      const changes = diff(form.formState, initial);
      if (Object.keys(changes).length > 0) {
        form.handleSubmit();
      }
    }
  }, [form.formState, initial]);

  // Default toolbar styles
  const toolbarStyles: CSSProperties = {
    zIndex: 1000,
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    width: 'fit-content',
    padding: '2px 6px',
    background: 'var(--figma-color-bg)',
    borderRadius: 'var(--radius-large)',
    boxShadow: '0px 3px 8px rgba(0, 0, 0, .35), 0px 1px 3px rgba(0, 0, 0, .5), inset 0px .5px 0px rgba(255, 255, 255, .08), inset 0px 0px .5px rgba(255, 255, 255, .3)',
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.2s ease',
    ...style,
  };

  return form.formState ? (
    <div className={`node-toolbar ${className || ''}`} style={toolbarStyles}>
      <div style={{display: 'flex', alignItems: 'center', width: '100%', gap: '2px'}}>
        {groups
          .filter(g => !DISABLED_ATTRS.includes(g.group))
          .map(g =>
            <NodeGroup
              key={g.group}
              state={form.formState}
              update={form.setFormState}
              setDialogOpen={isOpen => setVisible(!isOpen)}
              {...{node, nodeSrc, close}}
              {...g}
            />
          )
        }
        <IconButton
          aria-label="Close"
          onClick={close}
          size="medium"
          className="node-toolbar-btn">
          <IconCross/>
        </IconButton>
      </div>
    </div>
  ) : <div style={{display: 'none'}} {...form.initialFocus}/>;
}
