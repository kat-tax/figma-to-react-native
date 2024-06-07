import type {Fiber} from 'react-reconciler';


/**
 * only native html tag fiber's type will be string,
 * all the others (component / functional component / context) type will be function or object
 */
export const isNativeTagFiber = (fiber?: Fiber): boolean => typeof fiber?.type === 'string';

/**
 * React Fiber symbol types see:
 * https://github.com/facebook/react/blob/v17.0.0/packages/shared/ReactSymbols.js#L39-L58
 */
export const isReactSymbolFiber = (fiber?: Fiber): boolean =>
  typeof fiber?.type?.$$typeof === 'symbol';

export const isForwardRef = (fiber?: Fiber): boolean =>
  fiber?.type?.$$typeof === Symbol.for('react.forward_ref');

type HTMLElementWithFiber = HTMLElement & {
  [fiberKey: string]: Fiber | undefined;
}

const cachedFiberKeys: Set<string> = new Set();

/**
 * Get Fiber via React renderer which registered by `reconciler.injectIntoDevTools()`
 * like: https://github.com/facebook/react/blob/v17.0.0/packages/react-dom/src/client/ReactDOM.js#L220
 */
const getFiberWithDevtoolHook = (element: any): Fiber | undefined => {
  if (!globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers) return;
  const {renderers} = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  for (const renderer of renderers.values()) {
    try {
      const fiber = renderer.findFiberByHostInstance?.(element);
      if (fiber) return fiber;
    }
    catch {}
  }
}

/**
 * https://stackoverflow.com/questions/29321742/react-getting-a-component-from-a-dom-element-for-debugging
 */
export const getElementFiber = (_element?: HTMLElement): Fiber | undefined => {
  const element = _element as HTMLElementWithFiber;
  if (!element) return undefined;

  const fiberByDevtoolHook = getFiberWithDevtoolHook(element);
  if (fiberByDevtoolHook) {
    return fiberByDevtoolHook;
  }

  for (const cachedFiberKey of cachedFiberKeys) {
    if (element[cachedFiberKey]) {
      return element[cachedFiberKey] as Fiber;
    }
  }

  const fiberKey = Object.keys(element).find(key => (
    /**
     * for react >= v16.14.0
     * https://github.com/facebook/react/blob/v16.14.0/packages/react-dom/src/client/ReactDOMComponentTree.js#L39
     */
    key.startsWith('__reactFiber$')
    /**
     * for react <= v16.14.0
     * https://github.com/facebook/react/blob/v16.14.0/packages/react-dom/src/client/ReactDOMComponentTree.js#L21
     */
    || key.startsWith('__reactInternalInstance$')
  ))

  if (fiberKey) {
    cachedFiberKeys.add(fiberKey);
    return element[fiberKey] as Fiber;
  }

  return undefined;
}

export const getElementFiberUpward = (element: HTMLElement | null | undefined): Fiber | undefined => {
  if (!element) return undefined;
  const fiber = getElementFiber(element);
  if (fiber) return fiber;
  return getElementFiberUpward(element.parentElement);
}

/**
 * find first parent of native html tag or react component,
 * skip react Provider / Context / ForwardRef / Fragment etc.
 */
export const getDirectParentFiber = (child: Fiber): Fiber | null => {
  let current = child.return;
  while (current) {
    /**
     * react fiber symbol types see:
     * https://github.com/facebook/react/blob/v17.0.0/packages/shared/ReactSymbols.js#L39-L58
     */
    if (!isReactSymbolFiber(current)) return current;
    current = current.return;
  }
  return null;
}


/**
 * The displayName property is not guaranteed to be a string.
 * It's only safe to use for our purposes if it's a string.
 * github.com/facebook/react-devtools/issues/803
 *
 * https://github.com/facebook/react/blob/v17.0.0/packages/react-devtools-shared/src/utils.js#L90-L112
 */
export const getFiberName = (fiber?: Fiber | null): string | undefined => {
  const fiberType = fiber?.type;
  if (!fiberType) return undefined;

  if (typeof fiberType === 'string')
    return fiberType;

  const {displayName, name} = fiberType;
  if (typeof displayName === 'string') {
    return displayName;
  } else if (typeof name === 'string') {
    return name;
  }

  return undefined;
}
