import {useCallback, useState} from 'react';
import {useWindowKeyDown} from './use-window-key-down';
import {useInitialFocus} from './use-initial-focus';
import {useFocusTrap} from './use-focus-trap';

import type {InitialFocus} from './use-initial-focus';

export function useForm<State>(
  initialState: State,
  options: {
    close: (state: State) => void,
    transform?: (state: State) => State,
    validate?: (state: State) => boolean,
    submit: (state: State) => void,
  },
): {
  disabled: boolean,
  formState: State,
  initialFocus: InitialFocus,
  handleSubmit: () => void,
  setFormState: <Name extends keyof State>(
    state: State[Name],
    name: undefined | Name,
  ) => void,
} {

  const {close, submit, transform, validate} = options;
  const [formState, setState] = useState(initialState);
  const setFormState = useCallback(<Name extends keyof State>(value: State[Name], name?: Name) => {
    if (typeof name === 'undefined')
      throw new Error('`name` is `undefined`');
    setState(function (previousState: State): State {
      const newState = {...previousState, ...{[name]: value}};
      return typeof transform === 'undefined'
        ? newState
        : transform(newState);
    })
  }, [transform]);

  const handleSubmit = useCallback((): void => {
    if (typeof validate !== 'undefined' && validate(formState) === false)
      return;
    submit(formState);
  }, [formState, submit, validate]);

  useWindowKeyDown('Enter', handleSubmit);

  const handleClose = useCallback((): void => {
    close(formState);
  }, [close, formState]);

  useWindowKeyDown('Escape', handleClose);
  useFocusTrap();

  const initialFocus = useInitialFocus();
  const disabled = typeof validate !== 'undefined'
    ? validate(formState) === false
    : false;

  return {
    disabled,
    formState,
    initialFocus,
    handleSubmit,
    setFormState,
  };
}
