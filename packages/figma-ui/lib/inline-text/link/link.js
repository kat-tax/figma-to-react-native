import { h } from 'preact';
import { useCallback } from 'preact/hooks';
import { createClassName } from '../../utilities/create-class-name';
import { createComponent } from '../../utilities/create-component';
import { noop } from '../../utilities/no-op';
import styles from './link.module.css';
export const Link = createComponent(({ children, fullWidth = false, href, onKeyDown = noop, propagateEscapeKeyDown = true, target, ...rest }, ref) => {
    const handleKeyDown = useCallback(function (event) {
        onKeyDown(event);
        if (event.key === 'Escape') {
            if (propagateEscapeKeyDown === false) {
                event.stopPropagation();
            }
            event.currentTarget.blur();
        }
    }, [propagateEscapeKeyDown, onKeyDown]);
    return (h("a", { ...rest, ref: ref, href: href, target: target, tabIndex: 0, class: createClassName([styles.link, fullWidth === true ? styles.fullWidth : null]), onKeyDown: handleKeyDown }, children));
});
//# sourceMappingURL=link.js.map