
import {html, css, LitElement} from 'lit';
import {property, state} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';
import {computePosition, offset, flip, shift} from '@floating-ui/core';
import {customElement, getBoundingRect} from './utils';

import type {Dimensions} from '@floating-ui/core';
import type {CSSProperties} from 'react';
import type {PropertyValues} from 'lit';
import type {Rect, BoxSizing} from './types';

@customElement('inspector-overlay-tip')
export class InspectorOverlayTip extends LitElement {
  @property()
  public info = '';

  @property()
  public title = '';

  /** Target's bounding Rect */
  @property({attribute: false})
  public boundingRect?: Rect;

  /** Target's margin/border/padding sizing */
  @property({attribute: false})
  public boxSizing?: Pick<BoxSizing, `margin${'Top' | 'Left' | 'Right' | 'Bottom'}`>

  /** Viewport space box relative of client */
  @property({attribute: false})
  public spaceBox?: Rect;

  @state()
  protected position: Pick<CSSProperties, 'top' | 'left'> = {}

  @property({attribute: false})
  private infoStyle: ReturnType<typeof styleMap> = styleMap({})

  public updateTip({
    info,
    title,
    boundingRect,
    boxSizing,
    spaceBox,
  }: {
    info: string,
    title: string,
    /** Target element bounding Rect */
    boundingRect: Rect,
    /** Target element margin/border/padding */
    boxSizing: BoxSizing,
    /** Viewport space box relative of client */
    spaceBox?: Rect,
  }) {
    this.info = info;
    this.title = title;
    this.boxSizing = boxSizing;
    this.boundingRect = boundingRect;
    this.spaceBox = spaceBox ?? InspectorOverlayTip.getViewSpaceBox();
    this.infoStyle = styleMap({
      display: this.info ? 'block' : 'none',
    });
  }

  /**
   * Element outer box with margin
   */
  protected get outerBox(): Rect {
    const {boundingRect, boxSizing} = this;
    if (!boundingRect || !boxSizing) {
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      };
    }

    const top = boundingRect.y - Math.max(boxSizing.marginTop, 0);
    const left = boundingRect.x - Math.max(boxSizing.marginLeft, 0);
    const right = boundingRect.x + boundingRect.width + Math.max(boxSizing.marginRight, 0);
    const bottom = boundingRect.y + boundingRect.height + Math.max(boxSizing.marginBottom, 0);

    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    };
  }

  protected get width() {
    return Math.round(this.boundingRect?.width ?? 0);
  }

  protected get height() {
    return Math.round(this.boundingRect?.height ?? 0);
  }

  static getViewSpaceBox(boundaryWindow?: Window): Rect {
    const windowAgent = boundaryWindow ?? globalThis.__REACT_DEVTOOLS_TARGET_WINDOW__ ?? window;
    const documentBox = getBoundingRect(windowAgent.document.documentElement);
    return {
      x: documentBox.x + windowAgent.scrollX,
      y: documentBox.y + windowAgent.scrollY,
      width: windowAgent.innerWidth,
      height: windowAgent.innerHeight,
    };
  }

  override updated(changed: PropertyValues) {
    if (!changed.get('position')
      && this.boundingRect
      && this.boxSizing
      && this.spaceBox) {
      restraintTipPosition({
        elementBox: this.outerBox,
        spaceBox: this.spaceBox,
        tipSize: this.getBoundingClientRect().toJSON(),
      }).then(position => {
        this.position = position
        this.requestUpdate('position')
      });
    }
  }

  override render() {
    const hidden = !this.boundingRect || !this.boxSizing;

    this.style.setProperty('--inspector-overlay-tip-display', hidden ? 'none' : 'flex');
    this.style.setProperty('--inspector-overlay-tip-top', `${this.position.top}px`);
    this.style.setProperty('--inspector-overlay-tip-left', `${this.position.left}px`);

    return html`
      <div class='inspector-tip-name' >
        <div class='inspector-tip-title' >
          &lrm;${this.title}&lrm;
        </div>

        <div
          class='inspector-tip-info'
          style=${this.infoStyle}
        >
          &lrm;${this.info}&lrm;
        </div>
      </div>
      <div class='inspector-tip-separator'></div>
      <div class='inspector-tip-size' >
        ${this.width}px × ${this.height}px
      </div>
    `;
  }

  static styles = css`
    :host {
      position: fixed;
      z-index: 10000000;
      display: var(--inspector-overlay-tip-display, none);
      top: var(--inspector-overlay-tip-top, 0);
      left: var(--inspector-overlay-tip-left, 0);

      flex-flow: row nowrap;
      align-items: center;
      border-radius: 4px;
      padding: 4px 12px;
      background-color: #333740;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
      font-size: 12px;
      font-weight: bold;
      line-height: 1;
      white-space: nowrap;
      max-width: 97vw;
      box-sizing: border-box;
    }

    .inspector-tip-name {
      display: flex;
      flex-direction: column;
      flex: 0 1 auto;
      overflow: hidden;
    }

    .inspector-tip-separator {
      width: 0;
      flex: 0 0 auto;
      border-right: 1px solid #aaaaaa;
      margin-inline: 12px;
      height: 40px;
    }

    .inspector-tip-title, .inspector-tip-info {
      max-width: 750px;
      margin-block: 4px;
      color: #ee78e6;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      /**
       * use "direction: rtl" to ellipsis beginning of string from left;
       * and use Left-To-Right Mark "&lrm;" to avoid symbols reversed at beginning or end;
       * https://stackoverflow.com/questions/12761418/i-need-an-overflow-to-truncate-from-the-left-with-ellipses/66986273#66986273
       */
      direction: rtl;
      text-align: left;
    }
    .inspector-tip-title {
      font-size: 16px;
    }
    .inspector-tip-info {
      font-size: 14px;
    }
    .inspector-tip-size {
      flex: 0 0 auto;
      color: #d7d7d7;
    }
  `;
}

export const restraintTipPosition = async ({elementBox, spaceBox, tipSize}: {
  /** the `reference` of computePosition */
  elementBox: Rect,
  /** the `ClippingRect` of computePosition */
  spaceBox: Rect,
  /** the `floating` of computePosition */
  tipSize: Dimensions,
}): Promise<{top: number; left: number}> => {
  const {x, y} = await computePosition(elementBox, tipSize, {
    platform: {
      getElementRects: elementRects => elementRects,
      getDimensions: element => element,
      getClippingRect: () => spaceBox,
    },
    // y-axis is the main axis
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [
      offset(4),
      flip({
        fallbackAxisSideDirection: 'start',
        crossAxis: false,
      }),
      shift({
        padding: 4,
        crossAxis: true,
      }),
    ],
  });

  return {
    left: x,
    top: y,
  };
}
