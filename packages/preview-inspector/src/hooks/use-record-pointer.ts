import {useEffect, useRef} from 'react';
import type {MutableRefObject} from 'react';

export const useRecordPointer = ({disable}: {
  disable?: boolean,
}): MutableRefObject<PointerEvent | undefined> => {
  const pointerRef = useRef<PointerEvent>();

  useEffect(() => {
    const recordPointer = (event: PointerEvent) => {pointerRef.current = event}
    if (!disable)
      document.addEventListener('pointermove', recordPointer, true);
    return () => {
      pointerRef.current = undefined;
      document.removeEventListener('pointermove', recordPointer, true);
    };
  }, [disable]);

  return pointerRef;
}
