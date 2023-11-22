import { h } from 'preact';
import { createClassName } from '../../../utilities/create-class-name.js';
import { createComponent } from '../../../utilities/create-component.js';
import { RawTextbox } from './private/raw-textbox.js';
import styles from './textbox.module.css';
export const Textbox = createComponent(function ({ icon, variant, ...rest }, ref) {
    if (typeof icon === 'string' && icon.length !== 1) {
        throw new Error(`String \`icon\` must be a single character: ${icon}`);
    }
    return (h("div", { class: createClassName([
            styles.textbox,
            variant === 'border' ? styles.hasBorder : null,
            typeof icon === 'undefined' ? null : styles.hasIcon,
            rest.disabled === true ? styles.disabled : null
        ]) },
        h(RawTextbox, { ...rest, ref: ref, class: styles.input }),
        typeof icon === 'undefined' ? null : (h("div", { class: styles.icon }, icon)),
        h("div", { class: styles.border }),
        variant === 'underline' ? h("div", { class: styles.underline }) : null));
});
//# sourceMappingURL=textbox.js.map