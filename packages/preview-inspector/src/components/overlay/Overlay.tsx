import {html, css, LitElement} from 'lit';
import {ref, createRef} from 'lit/directives/ref.js';
import {InspectorOverlayRect} from './OverlayRect';
import {InspectorOverlayTip} from './OverlayTip';
import {
  customElement,
  registerElement,
  getBoundingRect,
  getElementDimensions,
} from './utils';

import type {Rect, BoxSizing} from './types';
import type {Ref} from 'lit/directives/ref.js';

@customElement('inspector-overlay')
export class InspectorOverlay extends LitElement {
  protected boxRef: Ref<InspectorOverlayRect> = createRef();
  protected tipRef: Ref<InspectorOverlayTip> = createRef();

  public async inspect<Element = HTMLElement>({
    element,
    title = '',
    info = '',
    getBoxSizing,
    getBoundingRect,
  }: {
    element?: Element,
    title?: string,
    info?: string,
    getBoxSizing: (element: Element) => BoxSizing,
    getBoundingRect: (element: Element) => Rect,
  }) {
    if (!element) return;

    // Ensure ref has set after render html
    if (!(this.boxRef.value && this.tipRef.value)) {
      await this.updateComplete;
    }

    const overlayRect = this.boxRef.value;
    const overlayTip = this.tipRef.value;

    if (!(overlayRect && overlayTip)) return;

    const boxSizing = getBoxSizing(element);
    const boundingRect = getBoundingRect(element);

    return this._inspect({
      title,
      info,
      overlayRect,
      overlayTip,
      boxSizing,
      boundingRect,
    });
  }

  public async hide() {
    await this.updateComplete;
    this.style.setProperty('--inspector-overlay-display', 'none');
  }

  protected _inspect({
    title,
    info,
    overlayRect,
    overlayTip,
    boxSizing,
    boundingRect,
  }: {
    title: string,
    info: string,
    overlayRect: InspectorOverlayRect,
    overlayTip: InspectorOverlayTip,
    boxSizing: BoxSizing,
    boundingRect: Rect,
  }) {
    this.style.setProperty('--inspector-overlay-display', 'block');

    overlayRect.updateBound({
      boxSizing,
      boundingRect,
    });

    overlayTip.updateTip({
      title,
      info,
      boxSizing,
      boundingRect,
    });
  }

  override render() {
    return html`
      <inspector-overlay-rect
        ${ref(this.boxRef)}
      >
      </inspector-overlay-rect>
      <inspector-overlay-tip
        ${ref(this.tipRef)}
      >
      </inspector-overlay-tip>
    `;
  }

  static styles = css`
    :host {
      position: fixed;
      display: var(--inspector-overlay-display, block);
      pointer-events: none;
      z-index: 10000000;
    }
  `;
}

export class Overlay {
  window: Window;
  overlay: InspectorOverlay;

  constructor() {
    // Ensure register without tree-shaking
    registerElement('inspector-overlay', InspectorOverlay);
    registerElement('inspector-overlay-rect', InspectorOverlayRect);
    registerElement('inspector-overlay-tip', InspectorOverlayTip);

    // Find the root window, because overlays are positioned relative to it
    const currentWindow = globalThis.__REACT_DEVTOOLS_TARGET_WINDOW__ || window;
    this.window = currentWindow;

    const doc = currentWindow.document;
    this.overlay = document.createElement('inspector-overlay');
    doc.body.appendChild(this.overlay);
  }

  public async inspect<Element = HTMLElement>({
    info,
    title,
    element,
    getBoxSizing = getElementDimensions,
    getBoundingRect: _getBoundingRect = getBoundingRect,
  }: {
    info?: string,
    title?: string,
    element?: Element,
    /**
     * default as `window.getComputedStyle(element)`
     */
    getBoxSizing?: (element: Element) => BoxSizing,
    /**
     * default as `element.getBoundingClientRect()`
     */
    getBoundingRect?: (element: Element) => Rect,
  }) {
    await this.overlay.inspect({
      info,
      title,
      element,
      getBoxSizing,
      getBoundingRect: _getBoundingRect,
    });
  }

  public async hide() {
    await this.overlay.hide();
  }

  public remove() {
    this.overlay.remove();
  }
}
