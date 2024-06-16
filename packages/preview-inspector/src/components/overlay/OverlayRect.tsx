import {html, css, LitElement} from 'lit';
import {property} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';
import {customElement} from './utils';

import type {StyleInfo} from 'lit/directives/style-map.js';
import type {CSSProperties} from 'react';
import type {Rect, BoxSizing} from './types';

@customElement('inspector-overlay-rect')
export class InspectorOverlayRect extends LitElement {
  private boxSizing?: BoxSizing;
  private boundingRect?: Rect;

  @property({attribute: false})
  private styles: {
    hostStyle: Pick<CSSProperties, 'top' | 'left'>,
    marginStyle: ReturnType<typeof styleMap>,
    borderStyle: ReturnType<typeof styleMap>,
    paddingStyle: ReturnType<typeof styleMap>,
    contentStyle: ReturnType<typeof styleMap>,
  } = {
    hostStyle: {top: 0, left: 0},
    marginStyle: styleMap({display: 'none'}),
    borderStyle: styleMap({display: 'none'}),
    paddingStyle: styleMap({display: 'none'}),
    contentStyle: styleMap({display: 'none'}),
  }

  public updateBound({boxSizing, boundingRect}: {
    boxSizing: BoxSizing,
    boundingRect: Rect,
  }) {
    this.boxSizing = boxSizing;
    this.boundingRect = boundingRect;
    this.styles = {
      hostStyle: {
        top: (this.boundingRect?.y ?? 0) - Math.max(this.boxSizing?.marginTop ?? 0, 0),
        left: (this.boundingRect?.x ?? 0) - Math.max(this.boxSizing?.marginLeft ?? 0, 0),
      },
      marginStyle: styleMap(this.getBoxStyle(this.boxSizing, 'margin') as StyleInfo),
      borderStyle: styleMap(this.getBoxStyle(this.boxSizing, 'border') as StyleInfo),
      paddingStyle: styleMap(this.getBoxStyle(this.boxSizing, 'padding') as StyleInfo),
      contentStyle: !(this.boundingRect && this.boxSizing)
        ? styleMap({})
        : styleMap({
          height: `${
            this.boundingRect.height
            - this.boxSizing.borderTop
            - this.boxSizing.borderBottom
            - this.boxSizing.paddingTop
            - this.boxSizing.paddingBottom
          }px`,
          width: `${
            this.boundingRect.width
            - this.boxSizing.borderLeft
            - this.boxSizing.borderRight
            - this.boxSizing.paddingLeft
            - this.boxSizing.paddingRight
          }px`,
        }),
    };
  }

  protected getBoxStyle(
    boxSizing: BoxSizing | undefined,
    type: 'margin' | 'padding' | 'border',
  ): CSSProperties {
    if (!boxSizing) {
      return {
        display: 'none',
      };
    }

    return {
      borderTopWidth: `${Math.max(boxSizing[`${type}Top`], 0)}px`,
      borderLeftWidth: `${Math.max(boxSizing[`${type}Left`], 0)}px`,
      borderRightWidth: `${Math.max(boxSizing[`${type}Right`], 0)}px`,
      borderBottomWidth: `${Math.max(boxSizing[`${type}Bottom`], 0)}px`,
      borderStyle: 'solid',
    };
  }

  override render() {
    const {
      hostStyle,
      marginStyle,
      borderStyle,
      paddingStyle,
      contentStyle,
    } = this.styles;

    this.style.setProperty('--inspector-overlay-rect-top', `${hostStyle.top}px`);
    this.style.setProperty('--inspector-overlay-rect-left', `${hostStyle.left}px`);

    return html`
      <div
        class='inspector-overlay-margin'
        style=${marginStyle}
      >
        <div
          class='inspector-overlay-border'
          style=${borderStyle}
        >
          <div
            class='inspector-overlay-padding'
            style=${paddingStyle}
          >
            <div
              class='inspector-overlay-content'
              style=${contentStyle}
            >
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Same color style used in `OverlayModel.buildHighlightConfig` with ChromeDevTools
   * https://github.com/ChromeDevTools/devtools-frontend/blob/chromium/6210/front_end/core/sdk/OverlayModel.ts#L553
   */
  static styles = css`
    :host {
      position: fixed;
      z-index: 10000000;
      display: var(--inspector-overlay-rect-display, block);
      cursor: default;
      top: var(--inspector-overlay-rect-top, 0);
      left: var(--inspector-overlay-rect-left, 0);
      box-sizing: border-box;
    }

    .inspector-overlay-margin {
      /**
       * PageHighlight.Margin in
       *   https://github.com/ChromeDevTools/devtools-frontend/blob/chromium/6210/front_end/core/common/Color.ts#L2322
       */
      border-color: rgba(246, 178, 107, .66);
    }
    .inspector-overlay-border {
      /**
       * PageHighlight.Border in
       *   https://github.com/ChromeDevTools/devtools-frontend/blob/chromium/6210/front_end/core/common/Color.ts#L2320
       */
      border-color: rgba(255, 229, 153, .66);
    }
    .inspector-overlay-padding {
      /**
       * PageHighlight.Padding in
       *   https://github.com/ChromeDevTools/devtools-frontend/blob/chromium/6210/front_end/core/common/Color.ts#L2318
       */
      border-color: rgba(147, 196, 125, .55);
    }
    .inspector-overlay-content {
      /**
       * PageHighlight.Content in
       *   https://github.com/ChromeDevTools/devtools-frontend/blob/chromium/6210/front_end/core/common/Color.ts#L2315
       */
      background-color: rgba(111, 168, 220, .66);
    }
  `;
}
