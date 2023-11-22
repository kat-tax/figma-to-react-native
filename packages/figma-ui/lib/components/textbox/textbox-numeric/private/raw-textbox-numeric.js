import { h } from 'preact';
import { useCallback, useRef, useState } from 'preact/hooks';
import { createComponent } from '../../../../utilities/create-component.js';
import { getCurrentFromRef } from '../../../../utilities/get-current-from-ref.js';
import { isValidNumericInput } from '../../../../utilities/is-valid-numeric-input.js';
import { evaluateNumericExpression } from '../../../../utilities/evaluate-numeric-expression.js';
import { MIXED_NUMBER, MIXED_STRING } from '../../../../utilities/mixed-values.js';
import { noop } from '../../../../utilities/no-op.js';
import { computeNextValue } from '../../private/compute-next-value.js';
import { isKeyCodeCharacterGenerating } from '../../private/is-keycode-character-generating.js';
import { formatEvaluatedValue } from './format-evaluated-value.js';
const FRACTION_DIGITS = 3;
const EMPTY_STRING = '';
export const RawTextboxNumeric = createComponent(function ({ disabled = false, incrementBig = 10, incrementSmall = 1, integer = false, maximum, minimum, onBlur = noop, onFocus = noop, onInput = noop, onMouseDown = noop, onKeyDown = noop, onNumericValueInput = noop, onValueInput = noop, placeholder, propagateEscapeKeyDown = true, revertOnEscapeKeyDown = false, suffix, validateOnBlur, value, ...rest }, ref) {
    if (typeof minimum !== 'undefined' &&
        typeof maximum !== 'undefined' &&
        minimum >= maximum) {
        throw new Error('`minimum` must be less than `maximum`');
    }
    const inputElementRef = useRef(null);
    const revertOnEscapeKeyDownRef = useRef(false);
    const [originalValue, setOriginalValue] = useState(EMPTY_STRING);
    const setInputElementValue = useCallback(function (value) {
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
        if (revertOnEscapeKeyDownRef.current === true) {
            revertOnEscapeKeyDownRef.current = false;
            return;
        }
        if (typeof validateOnBlur !== 'undefined') {
            const evaluatedValue = evaluateValue(value, suffix);
            const result = validateOnBlur(evaluatedValue);
            if (typeof result === 'number') {
                setInputElementValue(formatEvaluatedValue(result, value, suffix));
                setOriginalValue(EMPTY_STRING);
                return;
            }
            if (result === null) {
                setInputElementValue(EMPTY_STRING);
                setOriginalValue(EMPTY_STRING);
                return;
            }
            if (result === false) {
                if (value !== originalValue) {
                    setInputElementValue(originalValue);
                }
                setOriginalValue(EMPTY_STRING);
                return;
            }
        }
        if (typeof suffix !== 'undefined' && value === suffix) {
            setInputElementValue(EMPTY_STRING);
            setOriginalValue(EMPTY_STRING);
            return;
        }
        if (value !== EMPTY_STRING && value !== MIXED_STRING) {
            const evaluatedValue = evaluateValue(value, suffix);
            const formattedValue = formatEvaluatedValue(evaluatedValue, value, suffix);
            if (value !== formattedValue) {
                setInputElementValue(formattedValue);
            }
        }
        setOriginalValue(EMPTY_STRING);
    }, [onBlur, originalValue, setInputElementValue, suffix, validateOnBlur, value]);
    const handleFocus = useCallback(function (event) {
        onFocus(event);
        setOriginalValue(value);
        event.currentTarget.select();
    }, [onFocus, value]);
    const handleInput = useCallback(function (event) {
        onInput(event);
        const newValue = event.currentTarget.value;
        onValueInput(newValue);
        const evaluatedValue = evaluateValue(newValue, suffix);
        onNumericValueInput(evaluatedValue);
    }, [onInput, onNumericValueInput, onValueInput, suffix]);
    const handleKeyDown = useCallback(function (event) {
        onKeyDown(event);
        const key = event.key;
        if (key === 'Escape') {
            if (revertOnEscapeKeyDown === true) {
                revertOnEscapeKeyDownRef.current = true;
                setInputElementValue(originalValue);
                setOriginalValue(EMPTY_STRING);
            }
            if (propagateEscapeKeyDown === false) {
                event.stopPropagation();
            }
            event.currentTarget.blur();
            return;
        }
        const inputElement = event.currentTarget;
        if (key === 'ArrowDown' || key === 'ArrowUp') {
            const delta = event.shiftKey === true ? incrementBig : incrementSmall;
            event.preventDefault();
            if (value === EMPTY_STRING || value === MIXED_STRING) {
                const startingValue = (function () {
                    if (typeof minimum !== 'undefined' && minimum > 0) {
                        return minimum;
                    }
                    if (typeof maximum !== 'undefined' && maximum < 0) {
                        return maximum;
                    }
                    return 0;
                })();
                const evaluatedValue = evaluateValueWithDelta(startingValue, key === 'ArrowDown' ? -1 * delta : delta);
                const newValue = restrictValue(evaluatedValue, minimum, maximum);
                const formattedValue = formatEvaluatedValue(newValue, value, suffix);
                inputElement.value = formattedValue;
                inputElement.select();
                handleInput(event);
                return;
            }
            const number = evaluateValue(value, suffix);
            if (number === null) {
                throw new Error('`number` is `null`');
            }
            const evaluatedValue = evaluateValueWithDelta(number, key === 'ArrowDown' ? -1 * delta : delta);
            const newValue = restrictValue(evaluatedValue, minimum, maximum);
            const formattedValue = formatEvaluatedValue(newValue, value, suffix);
            if (formattedValue === value) {
                return;
            }
            inputElement.value = formattedValue;
            inputElement.select();
            handleInput(event);
            return;
        }
        if (event.ctrlKey === true || event.metaKey === true) {
            return;
        }
        if (isKeyCodeCharacterGenerating(event.keyCode) === true) {
            const newValue = trimSuffix(value === MIXED_STRING
                ? event.key
                : computeNextValue(inputElement, event.key), suffix);
            if (isValidNumericInput(newValue, { integersOnly: integer }) === false) {
                event.preventDefault();
                return;
            }
            if (typeof minimum === 'undefined' && typeof maximum === 'undefined') {
                return;
            }
            const evaluatedValue = evaluateNumericExpression(newValue);
            if (evaluatedValue === null) {
                return;
            }
            if ((typeof minimum !== 'undefined' && evaluatedValue < minimum) ||
                (typeof maximum !== 'undefined' && evaluatedValue > maximum)) {
                event.preventDefault();
            }
        }
    }, [
        handleInput,
        incrementBig,
        incrementSmall,
        integer,
        maximum,
        minimum,
        onKeyDown,
        originalValue,
        propagateEscapeKeyDown,
        revertOnEscapeKeyDown,
        setInputElementValue,
        suffix,
        value
    ]);
    const handleMouseDown = useCallback(function (event) {
        onMouseDown(event);
        if (value === MIXED_STRING) {
            event.preventDefault();
            event.currentTarget.select();
        }
    }, [onMouseDown, value]);
    const handlePaste = useCallback(function (event) {
        if (event.clipboardData === null) {
            throw new Error('`event.clipboardData` is `null`');
        }
        const nextValue = trimSuffix(computeNextValue(event.currentTarget, event.clipboardData.getData('Text')), suffix);
        if (isValidNumericInput(nextValue, {
            integersOnly: integer
        }) === false) {
            event.preventDefault();
        }
    }, [integer, suffix]);
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
    return (h("input", { ...rest, ref: refCallback, disabled: disabled === true, onBlur: handleBlur, onFocus: handleFocus, onInput: handleInput, onKeyDown: handleKeyDown, onMouseDown: handleMouseDown, onPaste: handlePaste, placeholder: placeholder, spellcheck: false, tabIndex: 0, type: "text", value: value === MIXED_STRING ? 'Mixed' : value }));
});
function restrictValue(value, minimum, maximum) {
    if (typeof minimum !== 'undefined') {
        if (typeof maximum !== 'undefined') {
            return Math.min(Math.max(value, minimum), maximum);
        }
        return Math.max(value, minimum);
    }
    if (typeof maximum !== 'undefined') {
        return Math.min(value, maximum);
    }
    return value;
}
function evaluateValue(value, suffix) {
    if (value === MIXED_STRING) {
        return MIXED_NUMBER;
    }
    if (value === EMPTY_STRING) {
        return null;
    }
    return evaluateNumericExpression(trimSuffix(value, suffix));
}
function evaluateValueWithDelta(value, delta) {
    return parseFloat((value + delta).toFixed(FRACTION_DIGITS));
}
function trimSuffix(string, suffix) {
    if (typeof suffix === 'undefined') {
        return string;
    }
    return string.replace(new RegExp(`${suffix}$`), EMPTY_STRING);
}
//# sourceMappingURL=raw-textbox-numeric.js.map