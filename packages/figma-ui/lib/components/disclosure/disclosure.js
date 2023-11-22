import { Fragment, h } from 'preact';
import { useCallback } from 'preact/hooks';
import { IconCaretRight16 } from '../../icons/icon-16/icon-caret-right-16.js';
import { createComponent } from '../../utilities/create-component.js';
import { noop } from '../../utilities/no-op.js';
import styles from './disclosure.module.css';
export const Disclosure = createComponent(function ({ children, onClick = noop, onKeyDown = noop, open, propagateEscapeKeyDown = true, title, ...rest }, ref) {
    const handleKeyDown = useCallback(function (event) {
        onKeyDown(event);
        if (event.key === 'Escape') {
            if (propagateEscapeKeyDown === false) {
                event.stopPropagation();
            }
            event.currentTarget.blur();
        }
    }, [onKeyDown, propagateEscapeKeyDown]);
    return (h(Fragment, null,
        h("label", { class: styles.label },
            h("input", { ...rest, ref: ref, checked: open === true, class: styles.input, onClick: onClick, onKeyDown: handleKeyDown, tabIndex: 0, type: "checkbox" }),
            h("div", { class: styles.title },
                h("div", { class: styles.icon },
                    h(IconCaretRight16, null)),
                title)),
        open === true ? h("div", { class: styles.children }, children) : null));
});
//# sourceMappingURL=disclosure.js.map