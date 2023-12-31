import {getFocusableElements} from './get-focusable-elements';

export function createFocusTrapKeyDownHandler(rootElement?: HTMLElement) {
  return function (event: KeyboardEvent): void {
    if (event.key !== 'Tab')
      return;
    event.preventDefault();
    const focusableElements = getFocusableElements(rootElement);
    if (focusableElements.length === 0)
      return;
    const index = findElementIndex(event.target as HTMLElement, focusableElements);
    // Focus the first element
    if (index === focusableElements.length - 1 && event.shiftKey === false) {
      focusableElements[0].focus();
      return;
    }
    // Focus the last element
    if (index === 0 && event.shiftKey) {
      focusableElements[focusableElements.length - 1].focus();
      return;
    }
    focusableElements[event.shiftKey ? index - 1 : index + 1].focus();
  }
}

function findElementIndex(targetElement: HTMLElement, elements: Array<HTMLElement>): number {
  return elements.reduce(function (
    result: number,
    element: HTMLElement,
    index: number
  ): number {
    if (result === -1 && element.isSameNode(targetElement)) {
      return index;
    }
    return result;
  }, -1);
}
