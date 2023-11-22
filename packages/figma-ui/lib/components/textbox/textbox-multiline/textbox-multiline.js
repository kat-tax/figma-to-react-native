import { h } from 'preact';
import { useCallback, useRef, useState } from 'preact/hooks';
import { createClassName } from '../../../utilities/create-class-name.js';
import { createComponent } from '../../../utilities/create-component.js';
import { getCurrentFromRef } from '../../../utilities/get-current-from-ref.js';
import { MIXED_STRING } from '../../../utilities/mixed-values.js';
import { noop } from '../../../utilities/no-op.js';
import { isKeyCodeCharacterGenerating } from '../private/is-keycode-character-generating.js';
import styles from './textbox-multiline.module.css';
const EMPTY_STRING = '';
export const TextboxMultiline = createComponent(function ({ grow = false, disabled = false, onBlur = noop, onFocus = noop, onInput = noop, onKeyDown = noop, onValueInput = noop, onMouseDown = noop, placeholder, propagateEscapeKeyDown = true, revertOnEscapeKeyDown = false, rows = 3, spellCheck = false, validateOnBlur, variant, value, ...rest }, ref) {
    const textAreaElementRef = useRef(null);
    const [originalValue, setOriginalValue] = useState(EMPTY_STRING);
    const setTextAreaElementValue = useCallback(function (value) {
        const textAreaElement = getCurrentFromRef(textAreaElementRef);
        textAreaElement.value = value;
        const inputEvent = new window.Event('input', {
            bubbles: true,
            cancelable: true
        });
        textAreaElement.dispatchEvent(inputEvent);
    }, []);
    const handleBlur = useCallback(function (event) {
        onBlur(event);
        if (typeof validateOnBlur !== 'undefined') {
            const result = validateOnBlur(value);
            if (typeof result === 'string') {
                setTextAreaElementValue(result);
                setOriginalValue(EMPTY_STRING);
                return;
            }
            if (result === false) {
                if (value !== originalValue) {
                    setTextAreaElementValue(originalValue);
                }
                setOriginalValue(EMPTY_STRING);
                return;
            }
        }
        setOriginalValue(EMPTY_STRING);
    }, [onBlur, originalValue, setTextAreaElementValue, validateOnBlur, value]);
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
                setTextAreaElementValue(originalValue);
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
        setTextAreaElementValue,
        value
    ]);
    const handleMouseDown = useCallback(function (event) {
        onMouseDown(event);
        if (value === MIXED_STRING) {
            event.preventDefault();
            event.currentTarget.select();
        }
    }, [onMouseDown, value]);
    const refCallback = useCallback(function (textAreaElement) {
        textAreaElementRef.current = textAreaElement;
        if (ref === null) {
            return;
        }
        if (typeof ref === 'function') {
            ref(textAreaElement);
            return;
        }
        ref.current = textAreaElement;
    }, [ref]);
    return (h("div", { class: createClassName([
            styles.textboxMultiline,
            typeof variant === 'undefined'
                ? null
                : variant === 'border'
                    ? styles.hasBorder
                    : null,
            grow === true ? styles.grow : null,
            disabled === true ? styles.disabled : null
        ]) },
        grow === true ? (h("div", { class: styles.ghost }, value === MIXED_STRING ? 'Mixed' : `${value} `)) : null,
        h("textarea", { ...rest, ref: refCallback, class: styles.textarea, disabled: disabled === true, onBlur: handleBlur, onFocus: handleFocus, onInput: handleInput, onKeyDown: handleKeyDown, onMouseDown: handleMouseDown, placeholder: placeholder, rows: rows, spellcheck: spellCheck, tabIndex: 0, value: value === MIXED_STRING ? 'Mixed' : value }),
        h("div", { class: styles.border }),
        variant === 'underline' ? h("div", { class: styles.underline }) : null));
});
//# sourceMappingURL=textbox-multiline.js.map