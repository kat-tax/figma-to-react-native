import { useCallback, useState } from 'preact/hooks';
import { useWindowKeyDown } from './use-window-key-down';
import { useInitialFocus } from './use-initial-focus';
import { useFocusTrap } from './use-focus-trap';
export function useForm(initialState, options) {
    const { close, submit, transform, validate } = options;
    const [formState, setState] = useState(initialState);
    const setFormState = useCallback(function (value, name) {
        if (typeof name === 'undefined') {
            throw new Error('`name` is `undefined`');
        }
        setState(function (previousState) {
            const newState = {
                ...previousState,
                ...{ [name]: value },
            };
            return typeof transform === 'undefined'
                ? newState
                : transform(newState);
        });
    }, [transform]);
    const handleSubmit = useCallback(function () {
        if (typeof validate !== 'undefined' && validate(formState) === false) {
            return;
        }
        submit(formState);
    }, [formState, submit, validate]);
    useWindowKeyDown('Enter', handleSubmit);
    const handleClose = useCallback(function () {
        close(formState);
    }, [close, formState]);
    useWindowKeyDown('Escape', handleClose);
    useFocusTrap();
    const disabled = typeof validate !== 'undefined'
        ? validate(formState) === false
        : false;
    const initialFocus = useInitialFocus();
    return {
        disabled,
        formState,
        handleSubmit,
        initialFocus,
        setFormState,
    };
}
//# sourceMappingURL=use-form.js.map