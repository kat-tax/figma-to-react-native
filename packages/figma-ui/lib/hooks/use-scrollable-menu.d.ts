import type { RefObject } from 'preact';
import type { Event } from '../types/event-handler';
export declare function useScrollableMenu(options: {
    itemIdDataAttributeName: string;
    menuElementRef: RefObject<HTMLDivElement>;
    selectedId: null | string;
    setSelectedId: (selectedId: string) => void;
}): {
    handleScrollableMenuKeyDown: (event: Event.onKeyDown<HTMLElement>) => void;
    handleScrollableMenuItemMouseMove: (event: Event.onMouseMove<HTMLElement>) => void;
};
//# sourceMappingURL=use-scrollable-menu.d.ts.map