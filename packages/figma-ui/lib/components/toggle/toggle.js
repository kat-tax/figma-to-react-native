import { h } from 'preact';
import { useCallback } from 'preact/hooks';
import { createClassName } from '../../utilities/create-class-name.js';
import { createComponent } from '../../utilities/create-component.js';
import { noop } from '../../utilities/no-op.js';
import styles from './toggle.module.css';
export const Toggle = createComponent(function ({ children, disabled = false, onChange = noop, onKeyDown = noop, onValueChange = noop, propagateEscapeKeyDown = true, value = false, ...rest }) {
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
    }, [propagateEscapeKeyDown, onKeyDown]);
    return (h("label", { class: createClassName([
            styles.toggle,
            disabled === true ? styles.disabled : null
        ]) },
        h("input", { ...rest, checked: value === true, class: styles.input, disabled: disabled === true, onChange: handleChange, onKeyDown: handleKeyDown, tabIndex: 0, type: "checkbox" }),
        h("div", { class: styles.box }),
        h("div", { class: styles.track }),
        h("div", { class: styles.children }, children)));
});
//# sourceMappingURL=toggle.js.map