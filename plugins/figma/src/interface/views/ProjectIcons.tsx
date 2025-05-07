import {emit} from '@create-figma-plugin/utilities';
import {Button, Flex, Select, Slider} from 'figma-kit';
import {IconPlus32} from 'figma-ui';
import {VirtuosoGrid} from 'react-virtuoso';
import {Fzf, byLengthAsc} from 'fzf';
import {useCopyToClipboard} from '@uidotdev/usehooks';
import {useState, useEffect, useMemo, useCallback} from 'react';
import {loadIconSets} from 'interface/icons/lib/iconify';
import {ProgressBar} from 'interface/base/ProgressBar';
import {ScreenInfo} from 'interface/base/ScreenInfo';
import {IconBrowse} from 'interface/icons/IconBrowse';
import {IconTile} from 'interface/icons/IconTile';

import type {Navigation} from 'interface/hooks/useNavigation';
import type {IconifySetPreview} from 'interface/icons/lib/iconify';
import type {EventNotify, EventProjectImportIcons} from 'types/events';
import type {ProjectIcons as ProjectIconsType} from 'types/project';
import type {ComponentBuild} from 'types/component';

interface ProjectIconsProps {
  build: ComponentBuild,
  icons: ProjectIconsType,
  nav: Navigation,
  hasStyles: boolean,
  isReadOnly: boolean,
  searchMode: boolean,
  searchQuery: string,
  onSubmit?: (selectedIcons: string[]) => void,
}

type ProjectIconsEntry = {
  item: ProjectIcon,
  positions: Set<number>,
}

type ProjectIcon = {
  icon: string,
  nodeId: string,
  missing: boolean,
  count: number,
}

export function ProjectIcons(props: ProjectIconsProps) {
  const [loadProgress, setLoadProgress] = useState(0);
  const [showBrowse, setShowBrowse] = useState(false);
  const [iconScale, setIconScale] = useState(1);
  const [category, setCategory] = useState(props.icons.sets[0]);
  const [list, setList] = useState<ProjectIconsEntry[]>([]);
  const [_, copyIcon] = useCopyToClipboard();

  const addSets = useCallback(async (sets: IconifySetPreview[]) => {
    if (!props.hasStyles) {
      props.nav.gotoTab('theme');
      emit<EventNotify>('NOTIFY', 'Generate a theme before importing icons');
      return;
    }
    const choice = confirm('Warning! Importing icons will overwrite the "Icons" page if it exists.\n\nContinue?');
    if (!choice) return;
    const icons = await loadIconSets(sets, setLoadProgress);
    emit<EventProjectImportIcons>('PROJECT_IMPORT_ICONS', icons);
  }, [props.hasStyles, props.nav]);

  // Rebuild list when icons or build change
  // TODO: this is the issue, this should use icons from the project
  // not the global cache from iconify
  const icons: ProjectIcon[] = useMemo(() => props.icons?.list
    ?.map(icon => ({
      icon,
      nodeId: props.icons?.map?.[icon] || null,
      missing: false, //!props.icons?.list?.includes(icon),
      count: props.build?.icons?.count?.[icon] || 0,
    }))
    ?.sort((a, b) => b.count - a.count), [
    props.icons?.list,
    props.build?.icons?.count,
  ]);

  // Rebuild index when icons change
  const index = useMemo(() => new Fzf(icons, {
    selector: (item) => item.icon,
    tiebreakers: [byLengthAsc],
    forward: false,
  }), [icons]);

  // Update list when search query changes or index changes
  useEffect(() => {
    const entries = index.find(props.searchQuery);
    setList(Object.values(entries));
  }, [index, props.searchQuery]);

  // Show browse interface
  if (!props.icons.sets?.length) {
    return showBrowse ? (
      <IconBrowse
        onSubmit={addSets}
        onClose={() => setShowBrowse(false)}
      />
    ) : (
      <ScreenInfo
        message="No icons found"
        action={!props.isReadOnly
          ? <div style={{display: 'flex', gap: '8px'}}>
              <Button
                variant="secondary"
                onClick={() => setShowBrowse(true)}>
                Browse Icon Sets
              </Button>
            </div>
          : null
        }
      />
    );
  }

  // Showing loading bar
  if (!list?.length) {
    return (
      <ProgressBar percent={`${loadProgress}%`}/>
    );
  }

  // Show icon grid
  return (
    <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
      <div style={{flex: 1}}>
        <VirtuosoGrid
          style={{height: '100%', scrollbarWidth: 'none'}}
          overscan={200}
          totalCount={list.length}
          itemContent={i =>
            <IconTile
              {...list[i].item}
              copy={copyIcon}
              scale={iconScale}
            />
          }
        />
      </div>
      <Flex
        gap="2"
        direction="row"
        style={{
          borderTop: '1px solid var(--figma-color-border)',
          padding: '12px',
        }}>
        <Select.Root
          value={category}
          onValueChange={setCategory}>
          <Select.Trigger style={{width: 'auto', maxWidth: 123}}/>
          <Select.Content
            position="popper"
            side="top"
            alignOffset={-28}>
            {props.icons.sets.map(set => (
              <Select.Item key={set} value={set}>
                {set}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <Button
          variant="secondary"
          size="small"
          style={{width: 32, padding: 0}}
          onClick={() => setShowBrowse(true)}>
          <IconPlus32/>
        </Button>
        <div style={{flex: 1}}/>
        <Slider
          min={1}
          max={10}
          step={0.1}
          value={[iconScale]}
          onValueChange={([value]) => setIconScale(value)}
          style={{maxWidth: 200}}
        />
      </Flex>
    </div>
  );
}
