import { useCallback, useEffect, useRef } from 'preact/hooks';
const mapResizeDirectionToStyles = {
    both: {
        cursor: 'nwse-resize',
        height: '12px',
        width: '12px'
    },
    horizontal: {
        cursor: 'ew-resize',
        height: '100%',
        width: '8px'
    },
    vertical: {
        cursor: 'ns-resize',
        height: '8px',
        width: '100%'
    }
};
export function useWindowResize(onWindowResize, options = {}) {
    const initialHeight = window.innerHeight;
    const initialWidth = window.innerWidth;
    const resizeBehaviorOnDoubleClick = typeof options.resizeBehaviorOnDoubleClick === 'undefined'
        ? null
        : options.resizeBehaviorOnDoubleClick;
    const maxHeight = typeof options.maxHeight === 'undefined'
        ? Number.MAX_VALUE
        : options.maxHeight;
    const maxWidth = typeof options.maxWidth === 'undefined'
        ? Number.MAX_VALUE
        : options.maxWidth;
    const minHeight = typeof options.minHeight === 'undefined'
        ? initialHeight
        : options.minHeight;
    const minWidth = typeof options.minWidth === 'undefined'
        ? initialWidth
        : options.minWidth;
    const resizeDirection = typeof options.resizeDirection === 'undefined'
        ? 'both'
        : options.resizeDirection;
    const windowSize = useRef({
        height: initialHeight,
        width: initialWidth,
    });
    const setWindowSize = useCallback(function ({ width, height }) {
        if (typeof width === 'undefined' && typeof height === 'undefined') {
            throw new Error('Need at least one of `width` or `height`');
        }
        if (typeof width !== 'undefined') {
            windowSize.current.width = Math.min(maxWidth, Math.max(minWidth, width));
        }
        if (typeof height !== 'undefined') {
            windowSize.current.height = Math.min(maxHeight, Math.max(minHeight, height));
        }
        onWindowResize(windowSize.current);
    }, [maxHeight, maxWidth, minHeight, minWidth, onWindowResize]);
    const toggleWindowSize = useCallback(function (resizeDirection) {
        if (resizeDirection === 'horizontal') {
            if (windowSize.current.width === initialWidth) {
                windowSize.current.width =
                    resizeBehaviorOnDoubleClick === 'minimize' ? minWidth : maxWidth;
            }
            else {
                windowSize.current.width = initialWidth;
            }
            onWindowResize(windowSize.current);
            return;
        }
        if (resizeDirection === 'vertical') {
            if (windowSize.current.height === initialHeight) {
                windowSize.current.height =
                    resizeBehaviorOnDoubleClick === 'minimize' ? minHeight : maxHeight;
            }
            else {
                windowSize.current.height = initialHeight;
            }
            onWindowResize(windowSize.current);
            return;
        }
        if (windowSize.current.width === initialWidth &&
            windowSize.current.height === initialHeight) {
            windowSize.current.width =
                resizeBehaviorOnDoubleClick === 'minimize' ? minWidth : maxWidth;
            windowSize.current.height =
                resizeBehaviorOnDoubleClick === 'minimize' ? minHeight : maxHeight;
        }
        else {
            windowSize.current.width = initialWidth;
            windowSize.current.height = initialHeight;
        }
        onWindowResize(windowSize.current);
    }, [
        initialHeight,
        initialWidth,
        maxHeight,
        maxWidth,
        minHeight,
        minWidth,
        onWindowResize,
        resizeBehaviorOnDoubleClick
    ]);
    useEffect(function () {
        const removeResizeHandleElements = [];
        const options = {
            resizeDirection,
            setWindowSize,
            toggleWindowSize: resizeBehaviorOnDoubleClick === null ? null : toggleWindowSize
        };
        if (resizeDirection === 'both') {
            removeResizeHandleElements.push(createResizeHandleElement({
                ...options,
                resizeDirection: 'horizontal'
            }));
            removeResizeHandleElements.push(createResizeHandleElement({ ...options, resizeDirection: 'vertical' }));
        }
        removeResizeHandleElements.push(createResizeHandleElement(options));
        return function () {
            for (const removeResizeHandleElement of removeResizeHandleElements) {
                removeResizeHandleElement();
            }
        };
    }, [
        maxHeight,
        maxWidth,
        minHeight,
        minWidth,
        resizeBehaviorOnDoubleClick,
        resizeDirection,
        setWindowSize,
        toggleWindowSize
    ]);
    return setWindowSize;
}
function createResizeHandleElement(options) {
    const { resizeDirection, setWindowSize, toggleWindowSize } = options;
    const resizeHandleElement = document.createElement('div');
    document.body.append(resizeHandleElement);
    const { cursor, height, width } = mapResizeDirectionToStyles[resizeDirection];
    resizeHandleElement.style.cssText = `cursor: ${cursor}; position: fixed; z-index: var(--z-index-2); bottom: 0; right: 0; width: ${width}; height: ${height};`;
    let pointerDownCursorPosition = null;
    resizeHandleElement.addEventListener('pointerdown', function (event) {
        pointerDownCursorPosition = {
            x: event.offsetX,
            y: event.offsetY
        };
        resizeHandleElement.setPointerCapture(event.pointerId);
    });
    resizeHandleElement.addEventListener('pointerup', function (event) {
        pointerDownCursorPosition = null;
        resizeHandleElement.releasePointerCapture(event.pointerId);
    });
    resizeHandleElement.addEventListener('pointermove', function (event) {
        if (pointerDownCursorPosition === null) {
            return;
        }
        const width = resizeDirection === 'both' || resizeDirection === 'horizontal'
            ? Math.round(event.clientX +
                (resizeHandleElement.offsetWidth - pointerDownCursorPosition.x))
            : undefined;
        const height = resizeDirection === 'both' || resizeDirection === 'vertical'
            ? Math.round(event.clientY +
                (resizeHandleElement.offsetHeight - pointerDownCursorPosition.y))
            : undefined;
        setWindowSize({ height, width });
    });
    if (toggleWindowSize !== null) {
        resizeHandleElement.addEventListener('dblclick', function () {
            toggleWindowSize(resizeDirection);
        });
    }
    return function () {
        resizeHandleElement.remove();
    };
}
//# sourceMappingURL=use-window-resize.js.map