import {useCallback, useEffect} from 'react';

export function useWindowKeyDown(
  key: KeyboardEvent['key'],
  onKeyDown: (e: KeyboardEvent) => void
): void {
  const handleKeyDown = useCallback(
    function (e: KeyboardEvent): void {
      if (e.key !== key)
        return;
      onKeyDown(e);
    },
    [key, onKeyDown]
  );

  useEffect(function (): () => void {
    window.addEventListener('keydown', handleKeyDown);
    return function (): void {
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);
}
