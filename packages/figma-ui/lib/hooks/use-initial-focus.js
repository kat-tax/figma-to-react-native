import { useEffect } from 'preact/hooks';
const INITIAL_FOCUS_DATA_ATTRIBUTE_NAME = 'data-initial-focus';
export function useInitialFocus() {
    useEffect(function () {
        const focusableElements = document.querySelectorAll(`[${INITIAL_FOCUS_DATA_ATTRIBUTE_NAME}]:not([tabindex="-1"]`);
        if (focusableElements.length === 0) {
            throw new Error(`No element with attribute \`${INITIAL_FOCUS_DATA_ATTRIBUTE_NAME}\``);
        }
        const checkedRadioButtonInputElement = Array.prototype.slice
            .call(focusableElements)
            .find(function (focusableElement) {
            const inputElement = focusableElement;
            return inputElement.type === 'radio' && inputElement.checked === true;
        });
        if (typeof checkedRadioButtonInputElement !== 'undefined') {
            checkedRadioButtonInputElement.focus();
            return;
        }
        focusableElements[0].focus();
    }, []);
    return {
        [INITIAL_FOCUS_DATA_ATTRIBUTE_NAME]: true,
    };
}
//# sourceMappingURL=use-initial-focus.js.map