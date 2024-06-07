import hotkeys from 'hotkeys-js';
import {useState, useEffect, useRef} from 'react';
import {useLayoutEffect} from './use-layout-effect';
import {useEffectEvent} from './use-effect-event';

import {type MutableRefObject} from 'react';

/**
 * Sync prop to state as a controlled component
 */
export const useControlledActive = ({
  onActiveChange,
  onActivate,
  onDeactivate,
  controlledActive,
  disable,
}: {
  onActiveChange?: (active: boolean) => void,
  onActivate?: () => void,
  onDeactivate?: () => void,
  controlledActive?: boolean,
  disable?: boolean,
}): {
    activate: () => void,
    deactivate: () => void,
    isActive: boolean,
    activeRef: MutableRefObject<boolean>,
  } => {
  const [isActive, setActive] = useState<boolean>(controlledActive ?? false);
  const activeRef = useRef<boolean>(isActive);

  // Sync state as controlled component
  useLayoutEffect(() => {
    if (controlledActive !== undefined) {
      activeRef.current = controlledActive;
      setActive(activeRef.current);
    }
  }, [controlledActive]);

  const activate = useEffectEvent(() => {
    onActiveChange?.(true);
    if (controlledActive === undefined) {
      activeRef.current = true;
      setActive(activeRef.current);
    }
  });

  const deactivate = useEffectEvent(() => {
    onActiveChange?.(false);
    if (controlledActive === undefined) {
      activeRef.current = false;
      setActive(activeRef.current);
    }
  });

  const handelEscapeToCancel = useEffectEvent((event?: KeyboardEvent) => {
    event?.preventDefault();
    event?.stopImmediatePropagation();
    deactivate?.();
  });

  const handleActivate = useEffectEvent(() => {
    onActivate?.();
    hotkeys('esc', {
      capture: true,
      element: window as any as HTMLElement,
    }, handelEscapeToCancel);
  });

  const handleDeactivate = useEffectEvent(() => {
    hotkeys.unbind('esc', handelEscapeToCancel);
    onDeactivate?.();
  });

  useEffect(() => {
    return () => {
      hotkeys.unbind('esc', handelEscapeToCancel);
    }
  }, []);

  // Trigger activate/deactivate next render after state change
  useEffect(() => {
    (isActive && !disable)
      ? handleActivate()
      : handleDeactivate();
    return onDeactivate;
  }, [isActive, disable]);

  return {
    activate,
    deactivate,
    isActive,
    activeRef,
  };
}

