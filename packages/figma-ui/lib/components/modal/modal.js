import { h, render } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { IconCross32 } from '../../icons/icon-32/icon-cross-32.js';
import { createClassName } from '../../utilities/create-class-name.js';
import { createComponent } from '../../utilities/create-component.js';
import { getCurrentFromRef } from '../../utilities/get-current-from-ref.js';
import { createFocusTrapKeyDownHandler } from '../../utilities/private/create-focus-trap-key-down-handler.js';
import { getFocusableElements } from '../../utilities/private/get-focusable-elements.js';
import { IconButton } from '../icon-button/icon-button.js';
import { Text } from '../text/text.js';
import styles from './modal.module.css';
export const Modal = createComponent(function ({ children, closeButtonIcon = h(IconCross32, null), closeButtonPosition = 'right', open, transition = true, onCloseButtonClick, onEscapeKeyDown, onOverlayClick, position = 'center', title, ...rest }, ref) {
    const portalElementRef = useRef(null);
    const modalElementsRef = useRef([]);
    const previousFocusedElementRef = useRef(null);
    useEffect(function () {
        const portalElement = document.createElement('div');
        document.body.appendChild(portalElement);
        portalElementRef.current = portalElement;
        return function () {
            document.body.removeChild(portalElement);
        };
    }, []);
    useEffect(function () {
        const portalElement = getCurrentFromRef(portalElementRef);
        const focusTrapKeyDownHandler = createFocusTrapKeyDownHandler(portalElement);
        function handleTabKeyDown(event) {
            if (open === true) {
                focusTrapKeyDownHandler(event);
            }
        }
        window.addEventListener('keydown', handleTabKeyDown);
        return function () {
            window.removeEventListener('keydown', handleTabKeyDown);
        };
    }, [open]);
    useEffect(function () {
        function handleEscapeKeyDown(event) {
            const modalElements = getCurrentFromRef(modalElementsRef);
            const portalElement = getCurrentFromRef(portalElementRef);
            if (open === false ||
                event.key !== 'Escape' ||
                typeof onEscapeKeyDown === 'undefined' ||
                modalElements[modalElements.length - 1] !== portalElement) {
                return;
            }
            onEscapeKeyDown(event);
        }
        window.addEventListener('keydown', handleEscapeKeyDown);
        return function () {
            window.removeEventListener('keydown', handleEscapeKeyDown);
        };
    }, [open, onEscapeKeyDown]);
    useEffect(function () {
        const modalElements = getCurrentFromRef(modalElementsRef);
        const portalElement = getCurrentFromRef(portalElementRef);
        const bodyElement = document.body;
        if (open === true) {
            if (modalElements.length === 0) {
                const hasScrollbar = bodyElement.scrollHeight > window.innerHeight;
                bodyElement.style.cssText += `position:fixed;overflow-y:${hasScrollbar === true ? 'scroll' : 'hidden'};width:100%;`;
            }
            modalElements.push(portalElement);
            portalElement.style.cssText =
                'position:absolute;top:0;left:0;bottom:0;right:0;z-index:1';
            previousFocusedElementRef.current =
                document.activeElement;
            const focusableElements = getFocusableElements(portalElement);
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
            else {
                previousFocusedElementRef.current.blur();
            }
        }
        else {
            if (modalElements.length === 1) {
                bodyElement.style.removeProperty('position');
                bodyElement.style.removeProperty('overflow-y');
                bodyElement.style.removeProperty('width');
            }
            modalElements.pop();
            portalElement.style.cssText = 'position:static';
        }
        return function () {
            if (previousFocusedElementRef.current !== null) {
                previousFocusedElementRef.current.focus();
            }
        };
    }, [open]);
    useEffect(function () {
        const portalElement = getCurrentFromRef(portalElementRef);
        render(h("div", { ref: ref },
            h("div", { ...rest, class: createClassName([
                    styles.modal,
                    open === true ? styles.open : null,
                    transition === false ? styles.noTransition : null,
                    styles[position]
                ]) },
                children,
                typeof onCloseButtonClick === 'undefined' &&
                    typeof title === 'undefined' ? null : (h("div", { class: styles.topBar },
                    h("div", { class: styles.title }, typeof title === 'undefined' ? null : (h(Text, null,
                        h("strong", null, title)))),
                    typeof onCloseButtonClick === 'undefined' ? null : (h("div", { class: closeButtonPosition === 'left'
                            ? styles.closeButtonLeft
                            : undefined },
                        h(IconButton, { onClick: onCloseButtonClick }, closeButtonIcon)))))),
            h("div", { class: styles.overlay, onClick: typeof onOverlayClick === 'undefined' ? undefined : onOverlayClick })), portalElement);
    }, [
        children,
        closeButtonIcon,
        closeButtonPosition,
        onCloseButtonClick,
        onOverlayClick,
        open,
        position,
        ref,
        rest,
        title,
        transition
    ]);
    return null;
});
//# sourceMappingURL=modal.js.map