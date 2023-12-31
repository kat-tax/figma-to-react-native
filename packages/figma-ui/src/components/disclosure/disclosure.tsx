import styles from './disclosure.module.css';

import {Fragment, useCallback} from 'react';
import {IconCaretRight16} from '../../icons/icon-16/icon-caret-right-16.js';
import {createComponent} from '../../utilities/create-component.js';
import {noop} from '../../utilities/no-op.js';

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
            <IconCaretRight16/>
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
