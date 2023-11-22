import { h, toChildArray } from 'preact';
import { createComponent } from '../../utilities/create-component.js';
import styles from './stack.module.css';
export const Stack = createComponent(function ({ children, space, ...rest }, ref) {
    return (h("div", { ...rest, ref: ref, class: styles[space] }, toChildArray(children).map(function (element, index) {
        return (h("div", { key: index, class: styles.child }, element));
    })));
});
//# sourceMappingURL=stack.js.map