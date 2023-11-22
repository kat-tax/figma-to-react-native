import { h } from 'preact';
import { createClassName } from '../../utilities/create-class-name.js';
import { createComponent } from '../../utilities/create-component.js';
import styles from './banner.module.css';
export const Banner = createComponent(function ({ children, icon, variant, ...rest }, ref) {
    return (h("div", { ...rest, ref: ref, class: createClassName([
            styles.banner,
            typeof variant === 'undefined' ? null : styles[variant]
        ]) },
        h("div", { class: styles.icon }, icon),
        h("div", { class: styles.children }, children)));
});
//# sourceMappingURL=banner.js.map