
export interface CodeInfo {
  lineNumber: string;
  columnNumber: string;
  /**
   * code source file relative path to dev-server cwd(current working directory)
   * need use with `@react-dev-inspector/babel-plugin`
   */
  relativePath?: string;
  /**
   * code source file absolute path
   * just need use with `@babel/plugin-transform-react-jsx-source` which auto set by most framework
   */
  absolutePath?: string;
}

/**
 * props that injected into react nodes
 *
 * like <div data-inspector-line="2" data-inspector-column="3" data-inspector-relative-path="xxx/ooo" />
 * this props will be record in fiber
 */
export interface CodeDataAttribute {
  'data-inspector-line': string;
  'data-inspector-column': string;
  'data-inspector-relative-path': string;
}


/**
 *
 * InspectAgent design different renderer binding (like React DOM, React Native, React Three.js etc.)
 *
 * An Agent need implement these functions:
 * - setup event listener to collect user interaction operation  (like Pointer Down/Up/Over / Click etc.)
 *   and its target element  (like DOM, Three.js etc.)
 * - collect inspection info from its element  (like name, code source position etc.)
 * - show/hide indicator UI on element  (like highlight element, show tooltip for name or code position etc.)
 */
export interface InspectAgent<Element> {
  /**
   * trigger when user activate inspector in <Inspector/>
   *
   * Agent need setup event listeners to collect user interaction on their target renderer (like DOM, React Native, React Three.js etc.)
   */
  activate(params: {
    /**
     * the initial `PointerMove` event when activate inspector,
     * use its position to check whether hovered any element immediately at initialization then trigger Inspector.
     */
    pointer?: PointerEvent;
    /**
     * when hovered a element
     * trigger it like on PointerMove on PointerOver event.
     */
    onHover: (params: { element: Element; pointer: PointerEvent }) => void;
    /**
     * Just throw the `PointerDown` event to Inspector,
     *   that's no need to stopPropagation or preventDefault in agent, Inspector will auto stop it when agent is in active.
     * Normally, the `PointerDown` event will stop by Inspector to prevent the default behavior like text selection,
     *   and the `Click` event will use to trigger the inspection and remove event listeners (by deactivate agent).
     */
    onPointerDown: (params: { element?: Element; pointer: PointerEvent }) => void;
    /**
     * just throw the `client` event to Inspector,
     *   that's no need to stopPropagation or preventDefault in agent, Inspector will auto stop it when agent is in active.
     * Normally, the `PointerDown` event will stop by Inspector to prevent the default behavior like text selection,
     *   and the `Click` event will use to trigger the inspection and remove event listeners (by deactivate agent).
     */
    onClick: (params: { element?: Element; pointer: PointerEvent }) => void;
  }): void;


  /**
   * trigger when user deactivate inspector in <Inspector/>,
   * to clear agent's indicators, remove event listeners, release resources and reset states
   */
  deactivate(): void;

  /**
   * use for filter valid elements from input element upward to render root.
   * a "valid" element considered have a valid name and you want show it in the inspected list.
   */
  getAncestorChain(element: Element): Generator<Element, void, void>;

  /**
   * get the element display name and title for show in indicator UI
   */
  getNameInfo(element: Element): (
    | undefined
    | {
      /** element's constructor name */
      name: string;
      /** display to describe the element as short */
      title: string;
    }
  );

  findCodeInfo(element: Element): CodeInfo | undefined;

  /**
   * show a indicator UI for the element on page
   */
  indicate(params: {
    element: Element;
    pointer: PointerEvent;
    name?: string;
    title?: string;
  }): void;

  /**
   * hide agent's indicator UI
   */
  removeIndicate(): void;
}
