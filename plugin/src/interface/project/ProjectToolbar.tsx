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
import {F2RN_SERVICE_URL} from 'config/consts';
import {docId} from 'store';

import type {UserSettings} from 'types/settings';
import type {ProjectConfig, ProjectComponentLayout} from 'types/project';
import type {EventNotify, EventOpenLink, EventProjectExport, EventProjectNewComponent} from 'types/events';

interface ProjectToolbarProps {
  project: ProjectConfig,
  settings: UserSettings,
  layout: ProjectComponentLayout,
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
  const [syncKey, setSyncKey] = useState<string>(props.project.gitKey ?? '');
  const [showNew, setShowNew] = useState<boolean>(false);
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [exportActive, setExportActive] = useState<boolean>(false);
  const viewState = useMemo(() => {
    if (props.showSync) return 'sync';
    if (showNew) return 'new';
    return 'overview';
  }, [props.showSync, showNew]);

  useProjectRelease(() => setExportActive(false));

  return (
    <StatusBar>
      {viewState === 'overview' && (
        <>
          <SegmentedControl.Root
            value={props.layout}
            onClick={() => props.setShowSettings(false)}
            onValueChange={(v: ProjectComponentLayout) => props.setLayout(v)}>
            <SegmentedControl.Item value="list" aria-label="View as list">
              <IconList/>
            </SegmentedControl.Item>
            <SegmentedControl.Item value="grid" aria-label="View as grid">
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
                <Text>Create New</Text>
              </DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => props.importComponents()}>
                <Text>Import EXO</Text>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild disabled={exportActive}>
              <IconButton
                size="small"
                aria-label={exportActive ? 'Exporting...' : 'Export Project'}
                onClick={() => props.setShowSettings(false)}
                disabled={exportActive}>
                <IconDownload/>
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item
                onSelect={() => {
                  emit<EventProjectExport>('PROJECT_EXPORT', {method: 'zip'}, props.project, props.settings);
                  setExportActive(true);
                }}
                disabled={exportActive}>
                <Text>Download Zip</Text>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => {
                  emit<EventProjectExport>('PROJECT_EXPORT', {method: 'git'}, props.project, props.settings);
                  setExportActive(true);
                }}
                disabled={exportActive}>
                <Text>Publish to Git</Text>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          {!sync.active && (
            <IconButton
              aria-label={sync.error ?? 'Start Sync'}
              size="small"
              onClick={async () => {
                if (syncLoading && !sync.error) return;
                // Missing or invalid sync key
                if (!syncKey || syncKey.length !== 40 || sync.error) {
                  props.setShowSync(true);
                // Start syncing
                } else {
                  setSyncLoading(true);
                  sync.connect(syncKey);
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
                  //setTimeout(() => copy(`${F2RN_SERVICE_URL}/sync/${docId}`), 100);
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
      {viewState === 'sync' && (
        <div style={{display: 'flex', flexDirection: 'row', gap: 12, flex: 1}}>
          <IconButton
            aria-label="Go back"
            size="small"
            onClick={() => props.setShowSync(false)}>
            <IconBack/>
          </IconButton>
          <div style={{position: 'relative', flex: 1}}>
            <Input
              autoFocus
              type="password"
              value={syncKey}
              onChange={e => setSyncKey(e.target.value)}
              placeholder="Project Token"
              style={{width: '100%', paddingRight: !syncKey ? 43 : '0.5rem'}}
            />
            {!syncKey && (
              <Button
                size="small"
                variant="success"
                onClick={() => {
                  emit<EventOpenLink>('OPEN_LINK', `${F2RN_SERVICE_URL}/dashboard`);
                }}
                style={{
                  transform: 'scale(0.9)',
                  position: 'absolute',
                  height: '20px',
                  right: 2,
                  top: 2,
                }}>
                Buy
              </Button>
            )}
          </div>
          <Button
            size="small"
            onClick={() => {
              // TODO: Save to project
              console.log('>>> project token', syncKey);
              props.setShowSync(false);
              setSyncLoading(true);
              sync.connect(syncKey);
            }}>
            Save
          </Button>
        </div>
      )}
      {viewState === 'new' && (
        <div style={{display: 'flex', flexDirection: 'row', gap: 12, flex: 1}}>
          <IconButton
            aria-label="Go back"
            size="small"
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
            onClick={() => {
              emit<EventProjectNewComponent>('PROJECT_NEW_COMPONENT', newInput.current?.value ?? '');
              setShowNew(false);
            }}>
            Create
          </Button>
        </div>
      )}
    </StatusBar>
  );
}
