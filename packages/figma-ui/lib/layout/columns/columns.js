import { h, toChildArray } from 'preact';
import { createClassName } from '../../utilities/create-class-name';
import { createComponent } from '../../utilities/create-component';
import styles from './columns.module.css';
export const Columns = createComponent(({ children, space, ...rest }, ref) => {
    return (h("div", { ...rest, ref: ref, class: createClassName([
            styles.columns,
            typeof space === 'undefined' ? null : styles[space]
        ]) }, toChildArray(children).map(function (element, index) {
        return (h("div", { key: index, class: styles.child }, element));
    })));
});
//# sourceMappingURL=columns.js.map