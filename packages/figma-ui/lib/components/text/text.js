import { h } from 'preact';
import { createClassName } from '../../utilities/create-class-name.js';
import { createComponent } from '../../utilities/create-component.js';
import styles from './text.module.css';
export const Text = createComponent(function ({ align = 'left', children, numeric = false, ...rest }) {
    return (h("div", { ...rest, class: createClassName([
            styles.text,
            styles[align],
            numeric === true ? styles.numeric : null
        ]) }, children));
});
//# sourceMappingURL=text.js.map