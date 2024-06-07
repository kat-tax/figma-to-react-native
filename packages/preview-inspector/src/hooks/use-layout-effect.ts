import {useEffect, useLayoutEffect as _useLayoutEffect} from 'react';

export const useLayoutEffect = (typeof window !== 'undefined'
  && window?.document?.createElement)
  ? _useLayoutEffect
  : useEffect;
