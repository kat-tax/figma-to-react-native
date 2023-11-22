import { h } from 'preact';
import { useCallback } from 'preact/hooks';
import { createClassName } from '../../utilities/create-class-name.js';
import { createComponent } from '../../utilities/create-component.js';
import { noop } from '../../utilities/no-op.js';
import styles from './range-slider.module.css';
export const RangeSlider = createComponent(function ({ disabled = false, increment = 1, maximum, minimum, onInput = noop, onKeyDown = noop, onNumericValueInput = noop, onValueInput = noop, propagateEscapeKeyDown = true, value, ...rest }, ref) {
    if (minimum >= maximum) {
        throw new Error('`minimum` must be less than `maximum`');
    }
    const handleInput = useCallback(function (event) {
        onInput(event);
        const value = event.currentTarget.value;
        onValueInput(value);
        onNumericValueInput(parseFloat(value));
    }, [onInput, onNumericValueInput, onValueInput]);
    const handleKeyDown = useCallback(function (event) {
        onKeyDown(event);
        if (event.key === 'Escape') {
            if (propagateEscapeKeyDown === false) {
                event.stopPropagation();
            }
            event.currentTarget.blur();
        }
    }, [onKeyDown, propagateEscapeKeyDown]);
    return (h("label", { class: createClassName([
            styles.rangeSlider,
            disabled === true ? styles.disabled : null
        ]) },
        h("input", { ...rest, ref: ref, class: styles.input, disabled: disabled, max: maximum, min: minimum, onInput: handleInput, onKeyDown: handleKeyDown, step: increment, type: "range", value: value }),
        h("div", { class: styles.border })));
});
//# sourceMappingURL=range-slider.js.map