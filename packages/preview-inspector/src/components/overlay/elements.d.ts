import {InspectorOverlay} from './Overlay';
import {InspectorOverlayTip} from './OverlayTip';
import {InspectorOverlayRect} from './OverlayRect';

import type {HTMLAttributes, RefAttributes} from 'react';

declare global {
  interface HTMLElementTagNameMap {
    'inspector-overlay': InspectorOverlay,
    'inspector-overlay-tip': InspectorOverlayTip,
    'inspector-overlay-rect': InspectorOverlayRect,
  }

  namespace JSX {
    interface IntrinsicElements {
      'inspector-overlay': RefAttributes<InspectorOverlay> & HTMLAttributes<InspectorOverlay>,
      'inspector-overlay-tip': RefAttributes<InspectorOverlayTip> & HTMLAttributes<InspectorOverlayTip>,
      'inspector-overlay-rect': RefAttributes<InspectorOverlayRect> & HTMLAttributes<InspectorOverlayRect>,
    }
  }
}