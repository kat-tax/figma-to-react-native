import {Button} from 'figma-kit';
import {useState} from 'react';
import {SyncAuthPopover} from 'interface/base/SyncAuthPopover';
import {useSync, NoAuthError} from 'interface/providers/Sync';

export function SyncButton() {
  const sync = useSync();
  const [_loading, setLoading] = useState<boolean>(false);
  const [authOpen, setAuthOpen] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  const handleSyncClick = async (apiKey?: string) => {
    console.log('>>> handleSyncClick', apiKey, sync.active, authOpen);
    // Auth open, close it
    if (authOpen)
      setAuthOpen(false);
    // Already connected, disconnect
    if (sync.active)
      return sync.disconnect();
    try {
      setLoading(true);
      await sync.connect(apiKey);
      setAuthError('');
      setAuthOpen(false);
      console.log('>>> success');
    } catch (error) {
      if (error instanceof NoAuthError) {
        setAuthOpen(true);
      } else {
        setAuthError('Invalid Project Key');
        setAuthOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SyncAuthPopover
      open={authOpen}
      projectKey={sync.projectKey}
      authError={authError}
      onOpenChange={setAuthOpen}
      onSubmit={apiKey => handleSyncClick(apiKey)}>
      <Button
        size="small"
        variant={authError ? 'destructive' : sync.active ? 'success' : 'secondary'}
        onClick={() => handleSyncClick()}>
        Sync
      </Button>
    </SyncAuthPopover>
  );
}
