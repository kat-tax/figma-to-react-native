import {useCallback, useMemo, useState} from 'react';
import {Flex, Text, SegmentedControl, Select, ValueField} from 'figma-kit';
import {getEasingPreset, easingPresets, getTransitionCurve} from './lib/transition';
import {ValueFieldSlider} from '../base/ValueFieldSlider';

import type {NodeMotionData} from 'types/node';

const DEFAULT_TYPE = 'tween';

export interface NodeTransitionProps {
  motion: NodeMotionData;
  onChange: (motion: NodeMotionData) => void;
}

export function NodeTransition({motion, onChange}: NodeTransitionProps) {
  const [data, setData] = useState<NodeMotionData>(motion);
  const curvePath = useMemo(() => getTransitionCurve(data.trans), [data.trans]);
  const easingPreset = useMemo(() => getEasingPreset(data.trans?.bezier), [data.trans?.bezier]);
  
  const update = useCallback((updates: Partial<typeof data.trans>) => {
    const updatedData = {...data, trans: {...data.trans, ...updates}};
    setData(updatedData);
    onChange(updatedData);
  }, [data, onChange]);

  return (
    <Flex direction="column" gap="3">
      {/* Transition Type: Ease vs Spring */}
      <SegmentedControl.Root
        value={data.trans?.type || DEFAULT_TYPE}
        onValueChange={v => update({type: v as 'tween' | 'spring'})}>
        <SegmentedControl.Item value="tween" aria-label="Ease">
          <Text style={{paddingInline: 8}}>Ease</Text>
        </SegmentedControl.Item>
        <SegmentedControl.Item value="spring" aria-label="Spring">
          <Text style={{paddingInline: 8}}>Spring</Text>
        </SegmentedControl.Item>
      </SegmentedControl.Root>
      {/* Motion Curve Preview */}
      <Flex direction="column" style={{marginTop: 4, marginBottom: 4}}>
        <svg width="100%" height="128" viewBox="0 0 300 157" style={{ 
          background: 'var(--figma-color-bg-secondary)', 
          borderRadius: 'var(--border-radius-med)'
        }}>
          {/* Midline */}
          <line 
            x1="10" 
            y1="78.5" 
            x2="290" 
            y2="78.5" 
            stroke="var(--figma-color-border)" 
            strokeWidth="1" 
            strokeDasharray="4,4" 
          />
          {/* Curve */}
          <path 
            d={curvePath} 
            fill="none" 
            stroke="var(--figma-color-text)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
        </svg>
      </Flex>
      {(!data.trans?.type || data.trans?.type === 'tween') && (
        <>
          {/* Ease Type */}
          <Flex direction="row" justify="between" align="center">
            <Text>Ease</Text>
            <Select.Root 
              value={easingPreset?.id ?? 'custom'} 
              onValueChange={v => {
                const preset = easingPresets[v as keyof typeof easingPresets];
                if (preset) update({bezier: [...preset.bezier]});
              }}>
              <Select.Trigger style={{width: '70%'}}>
                <span>{easingPreset?.name ?? 'Custom'}</span>
              </Select.Trigger>
              <Select.Content
                className="props-select"
                position="popper"
                side="bottom">
                {Object.entries(easingPresets).map(([id, {name, bezier}]) => (
                  <Select.Item
                    key={id}
                    value={id}
                    onSelect={() => update({bezier: [...bezier]})}>
                    {name}
                  </Select.Item>
                ))}
                {!easingPreset?.id && <>
                  <Select.Separator/>
                  <Select.Item value="custom" disabled>Custom</Select.Item>
                </>}
              </Select.Content>
            </Select.Root>
          </Flex>
          {/* Bezier Control Points */}
          <Flex direction="row" justify="between" align="center">
            <Text>Bezier</Text>
            <Flex style={{width: '70%'}} gap="2">
              <ValueField.Root style={{flex: 1}}>
                <ValueField.Numeric
                  bigNudge={0.1}
                  smallNudge={0.01}
                  value={data.trans?.bezier?.[0] ?? 0}
                  onChange={v => {
                    const pts = [...(data.trans?.bezier || [0, 0, 1, 1])];
                    pts[0] = v;
                    update({bezier: pts as [number, number, number, number]});
                  }}
                />
              </ValueField.Root>
              <ValueField.Root style={{flex: 1}}>
                <ValueField.Numeric
                  bigNudge={0.1}
                  smallNudge={0.01}
                  value={data.trans?.bezier?.[1] ?? 0}
                  onChange={v => {
                    const pts = [...(data.trans?.bezier || [0, 0, 1, 1])];
                    pts[1] = v;
                    update({bezier: pts as [number, number, number, number]});
                  }}
                />
              </ValueField.Root>
              <ValueField.Root style={{flex: 1}}>
                <ValueField.Numeric
                  bigNudge={0.1}
                  smallNudge={0.01}
                  value={data.trans?.bezier?.[2] ?? 1}
                  onChange={v => {
                    const pts = [...(data.trans?.bezier || [0, 0, 1, 1])];
                    pts[2] = v;
                    update({bezier: pts as [number, number, number, number]});
                  }}
                />
              </ValueField.Root>
              <ValueField.Root style={{flex: 1}}>
                <ValueField.Numeric
                  bigNudge={0.1}
                  smallNudge={0.01}
                  value={data.trans?.bezier?.[3] ?? 1}
                  onChange={v => {
                    const pts = [...(data.trans?.bezier || [0, 0, 1, 1])];
                    pts[3] = v;
                    update({bezier: pts as [number, number, number, number]});
                  }}
                />
              </ValueField.Root>
            </Flex>
          </Flex>
        </>
      )}
      {data.trans?.type === 'spring' && (
        <>
          {/* Spring Type (Time vs Physics) */}
          <Flex direction="row" justify="between" align="center">
            <Text>Based On</Text>
            <Flex style={{width: '70%'}}>
              <SegmentedControl.Root
                value={data.trans?.spring?.type || 'time'}
                onValueChange={v => {
                  update({
                    spring: {
                      ...(data.trans?.spring || {}),
                      type: v as 'time' | 'physics',
                    }
                  });
                }}>
                <SegmentedControl.Item value="time" aria-label="Time">
                  <Text style={{paddingInline: 8}}>Time</Text>
                </SegmentedControl.Item>
                <SegmentedControl.Item value="physics" aria-label="Physics">
                  <Text style={{paddingInline: 8}}>Physics</Text>
                </SegmentedControl.Item>
              </SegmentedControl.Root>
            </Flex>
          </Flex>
          {(!data.trans?.spring?.type || data.trans?.spring?.type === 'time') && (
            <>
              {/* Bounce */}
              <Flex direction="row" justify="between" align="center">
                <Text>Bounce</Text>
                <ValueFieldSlider
                  style={{width: '70%'}}
                  min={0}
                  max={1}
                  step={0.1}
                  value={data.trans?.spring?.bounce ?? 0.2}
                  onChange={v => update({
                    spring: {
                      ...(data.trans?.spring || {}),
                      type: 'time',
                      bounce: v,
                    }
                  })}
                />
              </Flex>
            </>
          )}
          {data.trans?.spring?.type === 'physics' && (
            <>
              {/* Stiffness */}
              <Flex direction="row" justify="between" align="center">
                <Text>Stiffness</Text>
                <ValueFieldSlider
                  style={{width: '70%'}}
                  min={1}
                  max={1000}
                  step={1}
                  value={data.trans?.spring?.stiffness ?? 400}
                  onChange={v => update({
                    spring: {
                      ...(data.trans?.spring || {}),
                      stiffness: v,
                      type: 'physics',
                    }
                  })}
                />
              </Flex>
              {/* Damping */}
              <Flex direction="row" justify="between" align="center">
                <Text>Damping</Text>
                <ValueFieldSlider
                  value={data.trans?.spring?.damping ?? 30}
                  onChange={v => update({
                    spring: {
                      ...(data.trans?.spring || {}),
                      damping: v,
                      type: 'physics',
                    }
                  })}
                  min={1}
                  max={100}
                  step={1}
                  style={{width: '70%'}}
                />
              </Flex>
              {/* Mass */}
              <Flex direction="row" justify="between" align="center">
                <Text>Mass</Text>
                <ValueFieldSlider
                  style={{width: '70%'}}
                  min={0.1}
                  max={10}
                  step={0.1}
                  value={data.trans?.spring?.mass ?? 1}
                  onChange={v => update({
                    spring: {
                      ...(data.trans?.spring || {}),
                      mass: v,
                      type: 'physics',
                    }
                  })}
                />
              </Flex>
            </>
          )}
        </>
      )}
      {(data.trans?.spring?.type !== 'physics' || data.trans?.type === 'tween') &&
        <>
          {/* Time */}
          <Flex direction="row" justify="between" align="center">
            <Text>Time</Text>
            <ValueFieldSlider
              style={{width: '70%'}}
              suffix="s"
              min={0}
              max={10}
              step={0.1}
              value={data.trans?.time ?? 0.3}
              onChange={v => update({
                time: v,
              })}
            />
          </Flex>
        </>
      }
      {/* Delay */}
      <Flex direction="row" justify="between" align="center">
        <Text>Delay</Text>
        <ValueFieldSlider
          style={{width: '70%'}}
          suffix="s"
          min={0}
          max={5}
          step={0.1}
          value={data.trans?.delay || 0}
          onChange={v => update({
            delay: v
          })}
        />
      </Flex>
    </Flex>
  );
}
