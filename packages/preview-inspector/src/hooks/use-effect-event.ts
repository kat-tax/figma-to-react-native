/**
 * Simple but not robust implement of React18 experimental hook `useEffectEvent`,
 *   to keep compatible with other React versions.
 *
 * for some more robust implements, you can see:
 * - `useEvent` in https://github.com/scottrippey/react-use-event-hook
 * - `useMemoizedFn` in https://github.com/alibaba/hooks
 */

import {useMemo, useRef} from 'react';

export const useEffectEvent = <T extends (...args: any[]) => any>(callback?: T) => {
  // Same as modify ref value in `useEffect`, used to avoid tear of layout update
  const callbackRef = useRef(callback);
  callbackRef.current = useMemo(() => callback, [callback]);

  // Init once
  const stableRef = useRef<T>();
  if (!stableRef.current) {
    stableRef.current = (
      function (this: ThisParameterType<T>, ...args) {
        return callbackRef.current?.apply(this, args);
      }
    ) as T;
  }

  return stableRef.current as T;
}
