import {Input, Button, Popover} from 'figma-kit';
import {useState} from 'react';

export interface SyncAuthPopoverProps extends Popover.RootProps {
  projectKey?: string;
  authError?: string;
  onSubmit: (value: string) => void;
}

export function SyncAuthPopover({
  projectKey,
  authError,
  children,
  onSubmit,
  ...props
}: SyncAuthPopoverProps) {
  const [input, setInput] = useState<string>(projectKey ?? '');
  return (
    <Popover.Root {...props}>
      <Popover.Trigger>
        {children}
      </Popover.Trigger>
      <Popover.Content
        side="top"
        sideOffset={8}
        style={{
          minWidth: 300,
          maxWidth: 400,
        }}>
        <Popover.Header>
          <Popover.Title>
            Sync to File
          </Popover.Title>
        </Popover.Header>
        <Popover.Section>
          <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
            <Input
              autoFocus
              type="password"
              value={input}
              onSubmit={() => onSubmit(input)}
              onKeyDown={e => e.key === 'Enter' && onSubmit(input)}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter your project API key"
              style={{width: '100%'}}
            />
            {authError && (
              <div style={{
                color: 'var(--figma-color-text-danger)',
                fontSize: '11px',
                lineHeight: '16px',
                marginTop: -4,
                padding: '6px 8px',
                borderRadius: '4px',
                backgroundColor: 'var(--figma-color-bg-danger-secondary)',
                border: '1px solid var(--figma-color-border-danger)',
              }}>
                {authError}
              </div>
            )}
            <div style={{display: 'flex', gap: 8, justifyContent: 'flex-end'}}>
              <Button
                size="small"
                variant="secondary"
                onClick={() => props.onOpenChange?.(false)}>
                Cancel
              </Button>
              <Button
                size="small"
                onClick={() => onSubmit(input)}>
                Connect
              </Button>
            </div>
          </div>
        </Popover.Section>
      </Popover.Content>
    </Popover.Root>
  );
}
