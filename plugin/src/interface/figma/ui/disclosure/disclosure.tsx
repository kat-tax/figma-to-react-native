import styles from './disclosure.module.css';

import {Fragment, useCallback} from 'react';
import {createComponent} from '../../lib/create-component.js';
import {noop} from '../../lib/no-op.js';

import type {ReactNode} from 'react';
import type {Event, EventHandler} from '../../types/event-handler.js';
import type {FocusableComponentProps} from '../../types/focusable-component-props.js';

export interface DisclosureProps extends FocusableComponentProps<HTMLInputElement> {
  open: boolean,
  title: string,
  children: ReactNode,
  onClick?: EventHandler.onClick<HTMLInputElement>,
}

export const Disclosure = createComponent<HTMLInputElement, DisclosureProps>(({
  open,
  title,
  children,
  onClick = noop,
  onKeyDown = noop,
  propagateEscapeKeyDown = true,
  ...rest
}, ref) => {

  const handleKeyDown = useCallback((e: Event.onKeyDown<HTMLInputElement>) => {
    onKeyDown(e)
    if (e.key === 'Escape') {
      if (propagateEscapeKeyDown === false)
        e.stopPropagation();
      e.currentTarget.blur();
    }
  }, [onKeyDown, propagateEscapeKeyDown]);

  return (
    <Fragment>
      <label className={styles.label}>
        <input
          {...rest}
          ref={ref}
          type="checkbox"
          checked={open}
          className={styles.input}
          onChange={noop}
          onKeyDown={handleKeyDown}
          onClick={onClick}
          tabIndex={0}
        />
        <div className={styles.title}>
          <div className={styles.icon}>
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 16 16">
              <path
                fill="#8d8d8d"
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M10.475 6.768a.5.5 0 0 1 0 .707L8.354 9.596 8 9.95l-.354-.354-2.12-2.121a.5.5 0 0 1 .706-.707L8 8.536l1.768-1.768a.5.5 0 0 1 .707 0"
              />
            </svg>
          </div>
          {title}
        </div>
      </label>
      {open
        ? <div className={styles.children}>{children}</div>
        : null
      }
    </Fragment>
  );
});
