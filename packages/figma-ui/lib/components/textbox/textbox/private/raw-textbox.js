import { h } from 'preact';
import { useCallback, useRef, useState } from 'preact/hooks';
import { createComponent } from '../../../../utilities/create-component.js';
import { getCurrentFromRef } from '../../../../utilities/get-current-from-ref.js';
import { MIXED_STRING } from '../../../../utilities/mixed-values.js';
import { noop } from '../../../../utilities/no-op.js';
import { isKeyCodeCharacterGenerating } from '../../private/is-keycode-character-generating.js';
const EMPTY_STRING = '';
export const RawTextbox = createComponent(function ({ disabled = false, onBlur = noop, onFocus = noop, onInput = noop, onKeyDown = noop, onMouseDown = noop, onValueInput = noop, password = false, placeholder, propagateEscapeKeyDown = true, revertOnEscapeKeyDown = false, spellCheck = false, validateOnBlur, value, ...rest }, ref) {
    const inputElementRef = useRef(null);
    const [originalValue, setOriginalValue] = useState(EMPTY_STRING);
    const setTextboxValue = useCallback(function (value) {
        const inputElement = getCurrentFromRef(inputElementRef);
        inputElement.value = value;
        const inputEvent = new window.Event('input', {
            bubbles: true,
            cancelable: true
        });
        inputElement.dispatchEvent(inputEvent);
    }, []);
    const handleBlur = useCallback(function (event) {
        onBlur(event);
        if (typeof validateOnBlur !== 'undefined') {
            const result = validateOnBlur(value);
            if (typeof result === 'string') {
                setTextboxValue(result);
                setOriginalValue(EMPTY_STRING);
                return;
            }
            if (result === false) {
                if (value !== originalValue) {
                    setTextboxValue(originalValue);
                }
                setOriginalValue(EMPTY_STRING);
                return;
            }
        }
        setOriginalValue(EMPTY_STRING);
    }, [onBlur, originalValue, setTextboxValue, validateOnBlur, value]);
    const handleFocus = useCallback(function (event) {
        onFocus(event);
        setOriginalValue(value);
        event.currentTarget.select();
    }, [onFocus, value]);
    const handleInput = useCallback(function (event) {
        onInput(event);
        const newValue = event.currentTarget.value;
        onValueInput(newValue);
    }, [onInput, onValueInput]);
    const handleKeyDown = useCallback(function (event) {
        onKeyDown(event);
        if (event.key === 'Escape') {
            if (revertOnEscapeKeyDown === true) {
                setTextboxValue(originalValue);
                setOriginalValue(EMPTY_STRING);
            }
            if (propagateEscapeKeyDown === false) {
                event.stopPropagation();
            }
            event.currentTarget.blur();
            return;
        }
        if (value === MIXED_STRING &&
            isKeyCodeCharacterGenerating(event.keyCode) === false) {
            event.preventDefault();
            event.currentTarget.select();
        }
    }, [
        onKeyDown,
        originalValue,
        propagateEscapeKeyDown,
        revertOnEscapeKeyDown,
        setTextboxValue,
        value
    ]);
    const handleMouseDown = useCallback(function (event) {
        onMouseDown(event);
        if (value === MIXED_STRING) {
            event.preventDefault();
            event.currentTarget.select();
        }
    }, [onMouseDown, value]);
    const refCallback = useCallback(function (inputElement) {
        inputElementRef.current = inputElement;
        if (ref === null) {
            return;
        }
        if (typeof ref === 'function') {
            ref(inputElement);
            return;
        }
        ref.current = inputElement;
    }, [ref]);
    return (h("input", { ...rest, ref: refCallback, disabled: disabled === true, onBlur: handleBlur, onFocus: handleFocus, onInput: handleInput, onKeyDown: handleKeyDown, onMouseDown: handleMouseDown, placeholder: placeholder, spellcheck: spellCheck, tabIndex: 0, type: password === true ? 'password' : 'text', value: value === MIXED_STRING ? 'Mixed' : value }));
});
//# sourceMappingURL=raw-textbox.js.map