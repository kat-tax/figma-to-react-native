import React, {ReactNode} from 'react';

interface StatusBarProps {
  children: ReactNode[];
}

export function StatusBar(props: StatusBarProps) {
  return (
    <div style={{
      height: '26px',
      padding: '0 8px',
      display: 'flex',
      alignItems: 'center',
    }}>
      {props.children}
    </div>
  );
}
