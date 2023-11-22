import { getFocusableElements } from './get-focusable-elements';
export function createFocusTrapKeyDownHandler(rootElement) {
    return function (event) {
        if (event.key !== 'Tab') {
            return;
        }
        event.preventDefault();
        const focusableElements = getFocusableElements(rootElement);
        if (focusableElements.length === 0) {
            return;
        }
        const index = findElementIndex(event.target, focusableElements);
        if (index === focusableElements.length - 1 && event.shiftKey === false) {
            focusableElements[0].focus();
            return;
        }
        if (index === 0 && event.shiftKey === true) {
            focusableElements[focusableElements.length - 1].focus();
            return;
        }
        focusableElements[event.shiftKey === true ? index - 1 : index + 1].focus();
    };
}
function findElementIndex(targetElement, elements) {
    return elements.reduce(function (result, element, index) {
        if (result === -1 && element.isSameNode(targetElement) === true) {
            return index;
        }
        return result;
    }, -1);
}
//# sourceMappingURL=create-focus-trap-key-down-handler.js.map