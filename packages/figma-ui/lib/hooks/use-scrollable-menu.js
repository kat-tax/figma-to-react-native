import { useCallback } from 'preact/hooks';
import { getCurrentFromRef } from '../utilities/get-current-from-ref';
export function useScrollableMenu(options) {
    const { itemIdDataAttributeName, menuElementRef, selectedId, setSelectedId } = options;
    const getItemElements = useCallback(function () {
        return Array.from(getCurrentFromRef(menuElementRef).querySelectorAll(`[${itemIdDataAttributeName}]`)).filter(function (element) {
            return element.hasAttribute('disabled') === false;
        });
    }, [itemIdDataAttributeName, menuElementRef]);
    const findIndexByItemId = useCallback(function (id) {
        if (id === null) {
            return -1;
        }
        const index = getItemElements().findIndex(function (element) {
            return element.getAttribute(itemIdDataAttributeName) === id;
        });
        if (index === -1) {
            throw new Error('`index` is `-1`');
        }
        return index;
    }, [getItemElements, itemIdDataAttributeName]);
    const updateScrollPosition = useCallback(function (id) {
        const itemElements = getItemElements();
        const index = findIndexByItemId(id);
        const selectedElement = itemElements[index];
        const selectedElementOffsetTop = selectedElement.getBoundingClientRect().top;
        const menuElement = getCurrentFromRef(menuElementRef);
        const menuElementOffsetTop = menuElement.getBoundingClientRect().top;
        if (selectedElementOffsetTop < menuElementOffsetTop) {
            selectedElement.scrollIntoView();
            return;
        }
        const offsetBottom = selectedElementOffsetTop + selectedElement.offsetHeight;
        if (offsetBottom > menuElementOffsetTop + menuElement.offsetHeight) {
            selectedElement.scrollIntoView();
        }
    }, [findIndexByItemId, getItemElements, menuElementRef]);
    const handleScrollableMenuKeyDown = useCallback(function (event) {
        const key = event.key;
        if (key === 'ArrowDown' || key === 'ArrowUp') {
            const itemElements = getItemElements();
            const index = findIndexByItemId(selectedId);
            let newIndex;
            if (key === 'ArrowDown') {
                newIndex =
                    index === -1 || index === itemElements.length - 1 ? 0 : index + 1;
            }
            else {
                newIndex =
                    index === -1 || index === 0 ? itemElements.length - 1 : index - 1;
            }
            const selectedElement = itemElements[newIndex];
            const newSelectedId = selectedElement.getAttribute(itemIdDataAttributeName);
            setSelectedId(newSelectedId);
            updateScrollPosition(newSelectedId);
        }
    }, [
        getItemElements,
        findIndexByItemId,
        itemIdDataAttributeName,
        setSelectedId,
        selectedId,
        updateScrollPosition
    ]);
    const handleScrollableMenuItemMouseMove = useCallback(function (event) {
        const id = event.currentTarget.getAttribute(itemIdDataAttributeName);
        if (id !== selectedId) {
            setSelectedId(id);
        }
    }, [itemIdDataAttributeName, selectedId, setSelectedId]);
    return {
        handleScrollableMenuItemMouseMove,
        handleScrollableMenuKeyDown
    };
}
//# sourceMappingURL=use-scrollable-menu.js.map