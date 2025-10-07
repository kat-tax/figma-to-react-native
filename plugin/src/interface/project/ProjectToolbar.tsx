import {emit} from '@create-figma-plugin/utilities';
import {Button, IconButton, SegmentedControl, Input, DropdownMenu, Text} from 'figma-kit';
import {useMemo, useState, useRef} from 'react';
import {useCopyToClipboard} from '@uidotdev/usehooks';
import {useProjectRelease} from 'interface/hooks/useProjectRelease';
import {useSync} from 'interface/providers/Sync';
import {IconDownload} from 'interface/figma/icons/24/Download';
import {IconTemplates} from 'interface/figma/icons/24/Templates';
import {IconGrid} from 'interface/figma/icons/24/Grid';
import {IconGear} from 'interface/figma/icons/24/Gear';
import {IconList} from 'interface/figma/icons/24/List';
import {IconSync} from 'interface/figma/icons/24/Sync';
import {IconBack} from 'interface/figma/icons/24/Back';
import {StatusBar} from 'interface/base/StatusBar';
import {UpgradeForm} from 'interface/extra/UpgradeForm';
import {useUpsellEvent} from 'interface/extra/hooks/useUpsellEvent';
import {F2RN_SERVICE_URL} from 'config/consts';
import {titleCase} from 'common/string';
import {docId} from 'store';

import type {EventNotify, EventProjectExport, EventProjectNewComponent} from 'types/events';
import type {ProjectComponentLayout} from 'types/project';
import type {SettingsData} from 'interface/hooks/useUserSettings';

interface ProjectToolbarProps {
  settings: SettingsData,
  layout: ProjectComponentLayout,
  effectiveLayout: ProjectComponentLayout,
  setLayout: (layout: ProjectComponentLayout) => void,
  showSync: boolean,
  setShowSync: (show: boolean) => void,
  showSettings: boolean,
  setShowSettings: (show: boolean) => void,
  importComponents: () => void,
}

export function ProjectToolbar(props: ProjectToolbarProps) {
  const sync = useSync();
  const newInput = useRef<HTMLInputElement>(null);
  const [_, copy] = useCopyToClipboard();
  const [showNew, setShowNew] = useState<boolean>(false);
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [exportActive, setExportActive] = useState<boolean>(false);
  const [tokenAction, setTokenAction] = useState<'sync' | 'download' | 'upgrade' | null>(null);
  const {upsellOpen, showUpsell, hideUpsell} = useUpsellEvent({onHide: () => setTokenAction(null)});

  const isInvalidToken = !props.settings.config?.projectToken?.length
    || props.settings.config?.projectToken?.length !== 40;

  const viewState = useMemo(() => {
    if (props.showSync || upsellOpen) return 'token';
    if (showNew) return 'new';
    return 'overview';
  }, [props.showSync, showNew, upsellOpen]);

  const handleLayoutClick = (newValue: ProjectComponentLayout) => {
    // If clicking the same value that's currently set (and not in auto), toggle to auto
    if (newValue === props.layout && props.layout !== 'auto') {
      props.setLayout('auto');
      emit<EventNotify>('NOTIFY', 'Switched to responsive mode', {timeout: 2000});
    } else {
      // If clicking a different value or clicking while in auto, switch to that value
      props.setLayout(newValue);
    }
  };

  useProjectRelease(() => setExportActive(false));

  return (
    <StatusBar>
      {viewState === 'overview' && (
        <>
          <SegmentedControl.Root
            value={props.effectiveLayout}
            onClick={() => props.setShowSettings(false)}>
            <SegmentedControl.Item
              value="list"
              aria-label={props.layout === 'auto' ? 'Currently auto layout - click to force list view' : 'View as list'}
              onClick={() => handleLayoutClick('list')}>
              <IconList/>
            </SegmentedControl.Item>
            <SegmentedControl.Item
              value="grid"
              aria-label={props.layout === 'auto' ? 'Currently auto layout - click to force grid view' : 'View as grid'}
              onClick={() => handleLayoutClick('grid')}>
              <IconGrid/>
            </SegmentedControl.Item>
          </SegmentedControl.Root>
          <div style={{flex: 1}}/>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <IconButton aria-label="Add Component" size="small" onClick={() => props.setShowSettings(false)}>
                <IconTemplates/>
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item onSelect={() => {
                setShowNew(true);
                setTimeout(() => newInput.current?.focus(), 100);
              }}>
                <Text>New Component</Text>
              </DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => props.importComponents()}>
                <Text>Import Library...</Text>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          <IconButton
            size="small"
            disabled={exportActive}
            aria-label={exportActive ? 'Exporting...' : 'Download App'}
            onClick={() => {
              if (isInvalidToken) {
                setTokenAction('download');
                showUpsell();
              } else {
                emit<EventProjectExport>('PROJECT_EXPORT', {method: 'zip'}, props.settings.config);
                setExportActive(true);
              }
            }}>
            <IconDownload/>
          </IconButton>
          {!sync.active && (
            <IconButton
              aria-label={sync.error ?? 'Start Sync'}
              size="small"
              onClick={async () => {
                if (syncLoading && !sync.error) return;
                if (isInvalidToken || sync.error) {
                  setTokenAction('sync');
                  showUpsell();
                } else {
                  setSyncLoading(true);
                  sync.connect();
                }
              }}>
              <div className={syncLoading && !sync.error ? 'rotate' : ''}>
                <IconSync color={sync.error ? 'danger' : undefined}/>
              </div>
            </IconButton>
          )}
          {sync.active && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <IconButton aria-label="Sync Active" size="small">
                  <IconSync color="success"/>
                </IconButton>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item onSelect={() => {
                  emit<EventNotify>('NOTIFY', 'Link copied to clipboard', {timeout: 3000});
                  setTimeout(() => copy(`${F2RN_SERVICE_URL}/sync/${docId}`), 100);
                }}>
                  <Text>Copy Link</Text>
                </DropdownMenu.Item>
                <DropdownMenu.Item onSelect={() => {
                  sync.disconnect();
                  setSyncLoading(false);
                }}>
                  <Text style={{color: 'var(--figma-color-text-danger)'}}>
                    Disconnect
                  </Text>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          )}
          <IconButton
            aria-label="Change Settings"
            size="small"
            className={props.showSettings ? 'icon-button-active' : ''}
            onClick={() => props.setShowSettings(!props.showSettings)}>
            <IconGear/>
          </IconButton>
        </>
      )}
      {viewState === 'token' && (
        <div style={{display: 'flex', flexDirection: 'row', gap: 12, flex: 1}}>
          <IconButton
            aria-label="Go back"
            size="small"
            type="button"
            onClick={() => {
              props.setShowSync(false);
              hideUpsell();
              setTokenAction(null);
            }}>
            <IconBack/>
          </IconButton>
          <UpgradeForm
            settings={props.settings}
            buttonText={titleCase(tokenAction)}
            onTokenValid={(token) => {
              hideUpsell();
              props.setShowSync(false);
              if (tokenAction === 'sync') {
                setSyncLoading(true);
                sync.connect(token);
              } else if (tokenAction === 'download') {
                emit<EventProjectExport>('PROJECT_EXPORT', {method: 'zip'}, props.settings.config);
                setExportActive(true);
                sync.connect(token, true);
              } else {
                emit<EventNotify>('NOTIFY', 'Project token saved.', {timeout: 3000});
                sync.connect(token, true);
              }
              setTokenAction(null);
            }}
            onTokenInvalid={() => {
              // Token is invalid, stay in upsell mode
            }}
          />
        </div>
      )}
      {viewState === 'new' && (
        <form
          style={{
            display: 'flex',
            flexDirection: 'row',
            margin: 0,
            gap: 12,
            flex: 1,
          }}
          onSubmit={(e) => {
            e.preventDefault();
            emit<EventProjectNewComponent>('PROJECT_NEW_COMPONENT', newInput.current?.value ?? '');
            setShowNew(false);
          }}>
          <IconButton
            aria-label="Go back"
            size="small"
            type="button"
            onClick={() => setShowNew(false)}>
            <IconBack/>
          </IconButton>
          <div style={{position: 'relative', flex: 1}}>
            <Input
              ref={newInput}
              autoFocus
              type="text"
              placeholder="Component Name"
              style={{width: '100%'}}
            />
          </div>
          <Button
            size="small"
            aria-label="Create Component"
            type="submit">
            Create
          </Button>
        </form>
      )}
    </StatusBar>
  );
}
