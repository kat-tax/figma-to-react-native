import { h } from 'preact';
import { createClassName } from '../../../utilities/create-class-name.js';
import { createComponent } from '../../../utilities/create-component.js';
import textboxStyles from '../textbox/textbox.module.css';
import { RawTextboxNumeric } from './private/raw-textbox-numeric.js';
import textboxNumericStyles from './textbox-numeric.module.css';
export const TextboxNumeric = createComponent(function ({ icon, variant, ...rest }, ref) {
    if (typeof icon === 'string' && icon.length !== 1) {
        throw new Error(`String \`icon\` must be a single character: ${icon}`);
    }
    return (h("div", { class: createClassName([
            textboxStyles.textbox,
            typeof variant === 'undefined'
                ? null
                : variant === 'border'
                    ? textboxStyles.hasBorder
                    : null,
            typeof icon === 'undefined' ? null : textboxStyles.hasIcon,
            rest.disabled === true ? textboxStyles.disabled : null
        ]) },
        h(RawTextboxNumeric, { ...rest, ref: ref, class: createClassName([
                textboxStyles.input,
                textboxNumericStyles.input
            ]) }),
        typeof icon === 'undefined' ? null : (h("div", { class: textboxStyles.icon }, icon)),
        h("div", { class: textboxStyles.border }),
        variant === 'underline' ? h("div", { class: textboxStyles.underline }) : null));
});
//# sourceMappingURL=textbox-numeric.js.map