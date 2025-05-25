import { useCallback, useRef } from 'react';

/**
 * A hook to throttle function calls.
 * @param callback The function to throttle.
 * @param delay The throttle delay in milliseconds.
 * @returns A throttled version of the provided function.
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const throttleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const throttledFunction = useCallback(
    (...args: Parameters<T>) => {
      if (throttleTimeout.current === null) {
        callback(...args);
        throttleTimeout.current = setTimeout(() => {
          throttleTimeout.current = null;
        }, delay);
      }
    },
    [callback, delay]
  );

  return throttledFunction;
};
