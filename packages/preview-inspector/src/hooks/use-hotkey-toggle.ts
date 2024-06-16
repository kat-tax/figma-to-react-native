import hotkeys from 'hotkeys-js';
import {useEffect} from 'react';

import type {MutableRefObject} from 'react';

export const defaultHotkeys = () => navigator.platform?.startsWith('Mac')
  ? ['Ctrl', 'Shift', 'Command', 'C']
  : ['Ctrl', 'Shift', 'Alt', 'C'];

export const useHotkeyToggle = ({
  keys,
  activate,
  deactivate,
  activeRef,
  disable,
}: {
  /**
   * Inspector Component toggle hotkeys,
   *
   * supported keys see: https://github.com/jaywcjlove/hotkeys#supported-keys
   *
   * @default - `['Ctrl', 'Shift', 'Command', 'C']` on macOS, `['Ctrl', 'Shift', 'Alt', 'C']` on other platforms.
   *
   * Setting `keys={null}` explicitly means that disable use hotkeys to trigger it.
   */
  keys?: string[] | null,
  /** Whether to disable all behavior include hotkeys listening or trigger */
  disable?: boolean,
  activeRef: MutableRefObject<boolean>,
  activate: () => void,
  deactivate: () => void,
}) => {
  const hotkey: string | null = keys === null
    ? null
    : (keys ?? []).join('+');

  useEffect(() => {
    const handleHotKeys = (event?: KeyboardEvent) => {
      event?.preventDefault();
      event?.stopImmediatePropagation();
      activeRef.current
        ? deactivate()
        : activate();
    };

    const bindKey = (hotkey === null || disable)
      ? null
      : (hotkey || defaultHotkeys().join('+'));

    if (bindKey) {
      hotkeys(bindKey, {
        capture: true,
        element: window as any as HTMLElement,
      }, handleHotKeys);
      return () => hotkeys.unbind(bindKey, handleHotKeys);
    }
  }, [hotkey, disable]);
}
