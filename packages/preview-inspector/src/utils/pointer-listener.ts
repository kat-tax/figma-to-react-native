export type StopFunction = () => void;

type Keys =
  | 'click'
  | 'mousedown'
  | 'mouseover'
  | 'mouseup'
  | 'pointerdown'
  | 'pointerover'
  | 'pointerup';

interface ListenableElement {
  addEventListener<K extends Keys>(type: K, listener: (ev: WindowEventMap[K]) => any, options?: EventListenerOptions): void,
  removeEventListener<K extends Keys>(type: K, listener: (ev: WindowEventMap[K]) => any, options?: EventListenerOptions): void,
}

export const setupPointerListener = (
  handlers: {
    target?: ListenableElement,
    onClick?: (params: {element: HTMLElement; pointer: PointerEvent}) => void,
    onPointerOver?: (params: {element: HTMLElement; pointer: PointerEvent}) => void,
    onPointerDown?: (params: {element: HTMLElement; pointer: PointerEvent}) => void,
  },
): StopFunction => {
  const startInspectingNative = () => {
    registerListeners(handlers.target ?? window);
  }

  const registerListeners = (element?: ListenableElement) => {
    // This plug-in may run in non-DOM environments (e.g. React Native).
    if (typeof element?.addEventListener === 'function') {
      element.addEventListener('click', onClick, {capture: true});
      element.addEventListener('mousedown', onPointerDown, {capture: true});
      element.addEventListener('mouseover', onStopEvent, {capture: true});
      element.addEventListener('mouseup', onStopEvent, {capture: true});
      element.addEventListener('pointerdown', onPointerDown, {capture: true});
      element.addEventListener('pointerover', onPointerOver, {capture: true});
      element.addEventListener('pointerup', onStopEvent, {capture: true});
    }
  }

  const stopInspectingNative = () => {
    removeListeners(handlers.target ?? window);
  }

  const removeListeners = (element?: ListenableElement) => {
    // This plug-in may run in non-DOM environments (e.g. React Native).
    if (typeof element?.removeEventListener === 'function') {
      element.removeEventListener('click', onClick, {capture: true});
      element.removeEventListener('mousedown', onPointerDown, {capture: true});
      element.removeEventListener('mouseover', onStopEvent, {capture: true});
      element.removeEventListener('mouseup', onStopEvent, {capture: true});
      element.removeEventListener('pointerdown', onPointerDown, {capture: true});
      element.removeEventListener('pointerover', onPointerOver, {capture: true});
      element.removeEventListener('pointerup', onStopEvent, {capture: true});
    }
  }

  const onStopEvent = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
  }

  const onPointerOver = (event: MouseEvent | PointerEvent) => {
    onStopEvent(event);
    const target = event.target as HTMLElement;
    handlers.onPointerOver?.({
      element: target,
      pointer: event as PointerEvent,
    });
  }

  const onPointerDown = (event: MouseEvent | PointerEvent) => {
    const target = event.target as HTMLElement;
    handlers.onPointerDown?.({
      element: target,
      pointer: event as PointerEvent,
    });
  }

  const onClick = (event: MouseEvent | PointerEvent) => {
    const target = event.target as HTMLElement;
    handlers.onClick?.({
      element: target,
      pointer: event as PointerEvent,
    });
  }

  startInspectingNative();
  return stopInspectingNative;
}
