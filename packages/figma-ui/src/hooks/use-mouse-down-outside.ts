import {useEffect} from 'react';
import {getCurrentFromRef} from '../utilities/get-current-from-ref';

import type {MutableRefObject} from 'react';

export function useMouseDownOutside(options: {
  ref: MutableRefObject<HTMLElement | null>
  onMouseDownOutside: () => void
}): void {
  const {ref, onMouseDownOutside} = options;
  useEffect(function (): () => void {
    // This is triggered when clicking outside the plugin `iframe`
    function handleBlur() {
      onMouseDownOutside();
    }
    function handleMouseDown(event: MouseEvent): void {
      const element = getCurrentFromRef(ref)
      if (element === event.target || element.contains(event.target as HTMLElement))
        return;
      onMouseDownOutside();
    }
    window.addEventListener('blur', handleBlur);
    window.addEventListener('mousedown', handleMouseDown);
    return function (): void {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('mousedown', handleMouseDown);
    }
  }, [ref, onMouseDownOutside]);
}
