import { ComponentChild } from 'preact';
import { EventHandler } from '../../types/event-handler.js';
export type ModalProps = {
    children: ComponentChild;
    closeButtonIcon?: ComponentChild;
    closeButtonPosition?: ModalCloseButtonPosition;
    open: boolean;
    transition?: boolean;
    onCloseButtonClick?: EventHandler.onClick<HTMLButtonElement>;
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    onOverlayClick?: EventHandler.onClick<HTMLDivElement>;
    position?: ModalPosition;
    title?: string;
};
export type ModalCloseButtonPosition = 'left' | 'right';
export type ModalPosition = 'bottom' | 'center' | 'left' | 'right';
export declare const Modal: import("preact").FunctionalComponent<Omit<import("../../utilities/create-component.js").MixinHTMLElementAttributes<HTMLDivElement, ModalProps>, "ref"> & {
    ref?: import("preact").Ref<HTMLDivElement> | undefined;
}>;
//# sourceMappingURL=modal.d.ts.map