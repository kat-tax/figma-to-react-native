import {useEffect} from 'react';
import {createFocusTrapKeyDownHandler} from '../lib/private/create-focus-trap-key-down-handler';

export function useFocusTrap(rootElement?: HTMLElement): void {
  useEffect(() => {
    const handleKeyDown = createFocusTrapKeyDownHandler(rootElement);
    window.addEventListener('keydown', handleKeyDown);
    return function (): void {
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, [rootElement]);
}
