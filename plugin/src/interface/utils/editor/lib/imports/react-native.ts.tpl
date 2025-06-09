/**
 * Augmentations for react-native types (for react-native-web support)
 */

/// <reference types="react" />

// Using module augmentation to extend the React Native types
declare module 'react-native' {
  // The following list is sourced from:
  // - https://github.com/necolas/react-native-web/blob/0.17.5/packages/react-native-web/src/types/styles.js#L76
  type CursorValue =
    | 'alias'
    | 'all-scroll'
    | 'auto'
    | 'cell'
    | 'context-menu'
    | 'copy'
    | 'crosshair'
    | 'default'
    | 'grab'
    | 'grabbing'
    | 'help'
    | 'pointer'
    | 'progress'
    | 'wait'
    | 'text'
    | 'vertical-text'
    | 'move'
    | 'none'
    | 'no-drop'
    | 'not-allowed'
    | 'zoom-in'
    | 'zoom-out'
    | 'col-resize'
    | 'e-resize'
    | 'ew-resize'
    | 'n-resize'
    | 'ne-resize'
    | 'ns-resize'
    | 'nw-resize'
    | 'row-resize'
    | 's-resize'
    | 'se-resize'
    | 'sw-resize'
    | 'w-resize'
    | 'nesw-resize'
    | 'nwse-resize';
  // This list is the combination of the following two lists:
  // - https://github.com/necolas/react-native-web/blob/0.17.5/packages/react-native-web/src/modules/AccessibilityUtil/propsToAriaRole.js#L10
  // - https://github.com/necolas/react-native-web/blob/0.17.5/packages/react-native-web/src/modules/AccessibilityUtil/propsToAccessibilityComponent.js#L12
  // Plus the single hard-coded value "label" from here:
  // - https://github.com/necolas/react-native-web/blob/0.17.5/packages/react-native-web/src/modules/AccessibilityUtil/propsToAccessibilityComponent.js#L36
  type WebAccessibilityRole =
    | 'adjustable'
    | 'article'
    | 'banner'
    | 'blockquote'
    | 'button'
    | 'code'
    | 'complementary'
    | 'contentinfo'
    | 'deletion'
    | 'emphasis'
    | 'figure'
    | 'form'
    | 'header'
    | 'image'
    | 'imagebutton'
    | 'insertion'
    | 'keyboardkey'
    | 'label'
    | 'link'
    | 'list'
    | 'listitem'
    | 'main'
    | 'navigation'
    | 'none'
    | 'region'
    | 'search'
    | 'strong'
    | 'summary'
    | 'text';

  interface PressableStateCallbackType {
    hovered?: boolean;
    focused?: boolean;
  }
  interface TextInputKeyPressEventData {
    key: string;
    metaKey: boolean;
    ctrlKey: boolean;
  }
  interface GestureResponderEvent {
    shiftKey: boolean;
    metaKey: boolean;
    ctrlKey: boolean;
  }
  interface ViewStyle {
    cursor?: CursorValue;
    transitionProperty?: string;
    transitionDuration?: string;
    display?: 'flex' | 'inline-flex' | 'none';
  }
  interface TextProps {
    dir?: 'ltr' | 'rtl' | 'auto';
    focusable?: boolean;
    accessibilityRole?: WebAccessibilityRole;
    accessibilityTraits?: never;
    accessibilityComponentType?: never;
    accessibilityState?: {
      busy?: boolean;
      checked?: boolean | 'mixed';
      disabled?: boolean;
      expanded?: boolean;
      grabbed?: boolean;
      hidden?: boolean;
      invalid?: boolean;
      pressed?: boolean;
      readonly?: boolean;
      required?: boolean;
      selected?: boolean;
    };
    href?: string;
    hrefAttrs?: {
      target?: '_blank' | '_self' | '_top' | 'blank' | 'self' | 'top';
      rel?: string;
      download?: boolean;
    };
    onMouseEnter?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onMouseLeave?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
    // For compatibility with RNW internals
    onMoveShouldSetResponder?: unknown;
    onMoveShouldSetResponderCapture?: unknown;
    onResponderEnd?: unknown;
    onResponderGrant?: unknown;
    onResponderMove?: unknown;
    onResponderReject?: unknown;
    onResponderRelease?: unknown;
    onResponderStart?: unknown;
    onResponderTerminate?: unknown;
    onResponderTerminationRequest?: unknown;
    onScrollShouldSetResponder?: unknown;
    onScrollShouldSetResponderCapture?: unknown;
    onSelectionChangeShouldSetResponder?: unknown;
    onSelectionChangeShouldSetResponderCapture?: unknown;
    onStartShouldSetResponder?: unknown;
    onStartShouldSetResponderCapture?: unknown;
  }

  interface TouchableOpacityProps {
    accessibilityRole?: WebAccessibilityRole;
    href?: string;
    hrefAttrs?: {
      target?: '_blank' | '_self' | '_top' | 'blank' | 'self' | 'top';
      rel?: string;
      download?: boolean;
    };
    nativeID?: string;
    onMouseEnter?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onMouseLeave?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  }

  interface CheckBoxProps {
    color?: string | null;
  }

  interface TextStyle {
    // The following list is sourced from:
    // - https://github.com/necolas/react-native-web/blob/0.17.5/packages/react-native-web/src/types/styles.js#L128
    userSelect?: 'all' | 'auto' | 'contain' | 'none' | 'text';
  }
} 