import {useCallback, useMemo, useState} from 'react';
import {Flex, Text, IconButton, Button, ValueField, SegmentedControl} from 'figma-kit';
import {ValueFieldSlider} from '../base/ValueFieldSlider';
import {getTransitionName} from './lib/transition';
import {NodeTransition} from './NodeTransition';
import {debounce} from 'common/delay';

import type {NodeMotionData} from 'types/node';

export interface NodeMotionProps {
  motion: NodeMotionData;
  showTransition: boolean;
  setShowTransition: (show: boolean) => void;
  onChangeMotion: (motion: NodeMotionData) => void;
}

export function NodeMotion({motion, showTransition, setShowTransition, onChangeMotion}: NodeMotionProps) {
  // Create a local copy of the motion
  const [data, setData] = useState<NodeMotionData>(motion);

  // Create debounced update function
  const commitData = useMemo(() => {
    if (onChangeMotion) {
      return debounce(onChangeMotion, 300);
    } else {
      return () => {};
    }
  }, [onChangeMotion]);

  const transitionName = useMemo(() =>
    getTransitionName(data.trans)
  , [data.trans]);

  const updateMotion = useCallback((updates: Partial<NodeMotionData>) => {
    const updated = {...data, ...updates};
    setData(updated);
    commitData(updated);
  }, [data, commitData]);

  const updateLoop = useCallback((updates: Partial<typeof data.loop>) => {
    const updated = {
      ...data,
      loop: {...data.loop, ...updates},
    };
    setData(updated);
    commitData(updated);
  }, [data, commitData]);

  const updateRotate = useCallback((updates: Partial<typeof data.rotate>) => {
    const updated = { 
      ...data, 
      rotate: { 
        ...data.rotate || {mode: '2D'}, 
        ...updates,
      },
    };
    setData(updated);
    commitData(updated);
  }, [data, commitData]);

  const updateSkew = useCallback((updates: Partial<typeof data.skew>) => {
    const updated = { 
      ...data, 
      skew: { 
        ...data.skew || {x: 0, y: 0}, 
        ...updates,
      },
    };
    setData(updated);
    commitData(updated);
  }, [data, commitData]);

  const updateOffset = useCallback((updates: Partial<typeof data.offset>) => {
    const updated = { 
      ...data, 
      offset: { 
        ...data.offset || {x: 0, y: 0}, 
        ...updates,
      },
    };
    setData(updated);
    commitData(updated);
  }, [data, commitData]);

  if (showTransition) {
    return (
      <NodeTransition
        motion={data}
        onChange={updateMotion}
      />
    );
  }

  return (
    <Flex direction="column" gap="3">
      {/* Delay */}
      <Flex direction="row" justify="between" align="center">
        <Text>Delay</Text>
        <Flex align="center" gap="2" style={{width: '70%'}}>
          <ValueField.Numeric
            value={data.loop?.delay ?? 0}
            onChange={v => updateLoop({delay: v})}
            suffix="s"
            style={{flex: 1}}
          />
          <Flex style={{flex: 1}}>
            <Flex gap="1" style={{width: '100%'}}>
              <IconButton 
                aria-label="Decrease delay" 
                onClick={() => updateLoop({delay: Math.max(0, (data.loop?.delay || 0) - 0.1)})}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </IconButton>
              <IconButton 
                aria-label="Increase delay" 
                onClick={() => updateLoop({delay: (data.loop?.delay || 0) + 0.1})}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </IconButton>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      {/* Opacity */}
      <Flex direction="row" justify="between" align="center">
        <Text>Opacity</Text>
        <ValueFieldSlider
          value={data.opacity ?? 1}
          onChange={v => updateMotion({opacity: v})}
          min={0}
          max={1}
          step={0.01}
          style={{width: '70%'}}
        />
      </Flex>
      {/* Scale */}
      <Flex direction="row" justify="between" align="center">
        <Text>Scale</Text>
        <ValueFieldSlider
          value={data.scale ?? 1}
          onChange={v => updateMotion({scale: v})}
          min={0}
          max={10}
          step={0.1}
          style={{width: '70%'}}
        />
      </Flex>
      {/* Rotate */}
      <Flex direction="row" justify="between" align="center">
        <Text>Rotate</Text>
        <Flex style={{width: '70%'}} gap="2" direction="column">
          <Flex gap="2">
            <SegmentedControl.Root
              style={{width: '50%'}}
              value={data.rotate?.mode ?? '2D'}
              onValueChange={v => updateRotate({mode: v as '2D' | '3D'})}>
              <SegmentedControl.Item value="2D" aria-label="2D">
                <Text style={{paddingInline: 8}}>2D</Text>
              </SegmentedControl.Item>
              <SegmentedControl.Item value="3D" aria-label="3D">
                <Text style={{paddingInline: 8}}>3D</Text>
              </SegmentedControl.Item>
            </SegmentedControl.Root>
            {(!data.rotate?.mode || data.rotate?.mode === '2D') ? (
              <ValueField.Numeric
                min={0}
                max={360}
                bigNudge={10}
                smallNudge={1}
                style={{flex: 1}}
                value={data.rotate?.x ?? 0}
                onChange={v => updateRotate({x: v})}
              />
            ) : (
              <div style={{flex: 1}}/>
            )}
          </Flex>
          {data.rotate?.mode === '3D' && (
            <Flex gap="2">
              <ValueField.Root style={{ flex: 1 }}>
                <ValueField.Label>X</ValueField.Label>
                <ValueField.Numeric
                  min={0}
                  max={360}
                  bigNudge={10}
                  smallNudge={1}
                  value={data.rotate?.x ?? 0}
                  onChange={v => updateRotate({x: v})}
                />
              </ValueField.Root>
              <ValueField.Root style={{ flex: 1 }}>
                <ValueField.Label>Y</ValueField.Label>
                <ValueField.Numeric
                  min={0}
                  max={360}
                  bigNudge={10}
                  smallNudge={1}
                  value={data.rotate?.y ?? 0}
                  onChange={v => updateRotate({y: v})}
                />
              </ValueField.Root>
              <ValueField.Root style={{ flex: 1 }}>
                <ValueField.Label>Z</ValueField.Label>
                <ValueField.Numeric
                  min={0}
                  max={360}
                  bigNudge={10}
                  smallNudge={1}
                  value={data.rotate?.z ?? 0}
                  onChange={v => updateRotate({z: v})}
                />
              </ValueField.Root>
            </Flex>
          )}
        </Flex>
      </Flex>
      {/* Skew */}
      <Flex direction="row" justify="between" align="center">
        <Text>Skew</Text>
        <Flex style={{width: '70%'}} gap="2">
          <ValueField.Root>
            <ValueField.Label>X</ValueField.Label>
            <ValueField.Numeric
              style={{flex: 1}}
              value={data.skew?.x ?? 0}
              onChange={v => updateSkew({x: v})}
              suffix="°"
            />
          </ValueField.Root>
          <ValueField.Root>
            <ValueField.Label>Y</ValueField.Label>
            <ValueField.Numeric
              style={{flex: 1}}
              value={data.skew?.y ?? 0}
              onChange={v => updateSkew({y: v})}
              suffix="°"
            />
          </ValueField.Root>
        </Flex>
      </Flex>
      {/* Offset */}
      <Flex direction="row" justify="between" align="center">
        <Text>Offset</Text>
        <Flex style={{width: '70%'}} gap="2">
          <ValueField.Root>
            <ValueField.Label>X</ValueField.Label>
            <ValueField.Numeric
              style={{flex: 1}}
              value={data.offset?.x ?? 0}
              onChange={v => updateOffset({x: v})}
            />
          </ValueField.Root>
          <ValueField.Root>
            <ValueField.Label>Y</ValueField.Label>
            <ValueField.Numeric
              style={{flex: 1}}
              value={data.offset?.y ?? 0}
              onChange={v => updateOffset({y: v})}
            />
          </ValueField.Root>
        </Flex>
      </Flex>
      {/* Transition */}
      <Flex direction="row" justify="between" align="center">
        <Text>Transition</Text>
        <Button
          variant="secondary"
          style={{width: '70%'}}
          onClick={() => setShowTransition(true)}>
          {transitionName}
        </Button>
      </Flex>
    </Flex>
  );
}
