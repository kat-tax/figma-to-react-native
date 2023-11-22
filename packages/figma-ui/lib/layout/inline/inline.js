import { h, toChildArray } from 'preact';
import { createComponent } from '../../utilities/create-component.js';
import styles from './inline.module.css';
export const Inline = createComponent(function ({ children, space, ...rest }, ref) {
    return (h("div", { ...rest, ref: ref, class: typeof space === 'undefined' ? undefined : styles[space] }, toChildArray(children).map(function (child, index) {
        return (h("div", { key: index, class: styles.child }, child));
    })));
});
//# sourceMappingURL=inline.js.map