import { h } from 'preact';
import { useCallback } from 'preact/hooks';
import { createClassName } from '../../utilities/create-class-name.js';
import { createComponent } from '../../utilities/create-component.js';
import { noop } from '../../utilities/no-op.js';
import styles from './layer.module.css';
export const Layer = createComponent(function ({ bold = false, children, component = false, description, icon, onChange = noop, onKeyDown = noop, onValueChange = noop, propagateEscapeKeyDown = true, value, ...rest }, ref) {
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
            styles.layer,
            bold === true ? styles.bold : null,
            component === true ? styles.component : null
        ]) },
        h("input", { ...rest, ref: ref, checked: value === true, class: styles.input, onChange: handleChange, onKeyDown: handleKeyDown, tabIndex: 0, type: "checkbox" }),
        h("div", { class: styles.box }),
        h("div", { class: styles.icon }, icon),
        h("div", { class: styles.children }, children),
        typeof description === 'undefined' ? null : (h("div", { class: styles.description }, description))));
});
//# sourceMappingURL=layer.js.map