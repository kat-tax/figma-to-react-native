import { h } from 'preact';
import { createComponent } from '../../utilities/create-component';
import styles from './container.module.css';
export const Container = createComponent(function ({ space, ...rest }, ref) {
    return (h("div", { ...rest, ref: ref, class: styles[space] }));
});
//# sourceMappingURL=container.js.map