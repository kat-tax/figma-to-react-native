import { h } from 'preact';
import { useCallback } from 'preact/hooks';
import { createClassName } from '../../utilities/create-class-name.js';
import { createComponent } from '../../utilities/create-component.js';
import { noop } from '../../utilities/no-op.js';
import styles from './icon-toggle-button.module.css';
export const IconToggleButton = createComponent(function ({ children, disabled = false, onChange = noop, onKeyDown = noop, onValueChange = noop, propagateEscapeKeyDown = true, value, ...rest }, ref) {
    const handleChange = useCallback(function (event) {
        onChange(event);
        const newValue = event.currentTarget.checked === true;
        onValueChange(newValue);
    }, [onChange, onValueChange]);
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
            styles.iconToggleButton,
            disabled === true ? styles.disabled : null
        ]) },
        h("input", { ...rest, ref: ref, checked: value === true, class: styles.input, disabled: disabled === true, onChange: handleChange, onKeyDown: handleKeyDown, tabIndex: 0, type: "checkbox" }),
        h("div", { class: styles.box },
            h("div", { class: styles.icon }, children))));
});
//# sourceMappingURL=icon-toggle-button.js.map