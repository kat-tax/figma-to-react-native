import {emit, on} from '@create-figma-plugin/utilities';
import {useWindowSize} from '@uidotdev/usehooks';
import {useState, useEffect, useMemo} from 'react';
import {Button, Flex, Select} from 'figma-kit';
import {Fzf, byLengthAsc} from 'fzf';
import {getPreviewSets} from './lib/iconify';
import {IconSet} from './IconSet';

import type {IconFavoriteToggle, IconFavoriteReq, IconFavoriteRes} from 'types/events';
import type {IconifySetPreview} from './lib/iconify';

interface IconBrowseProps {
  installedSets: string[],
  onSubmit: (sets: IconifySetPreview[]) => void,
  onClose: () => void,
  searchQuery: string,
  searchMode?: boolean,
}

export function IconBrowse(props: IconBrowseProps) {
  const [category, setCategory] = useState('all');
  const [previewSets, setPreviewSets] = useState<IconifySetPreview[]>([]);
  const [chosenSets, setChosenSets] = useState<IconifySetPreview[]>([]);
  const [favSets, setFavSets] = useState<string[]>();
  const screen = useWindowSize();
  
  // Build search index for icon sets
  const searchIndex = useMemo(() => new Fzf(previewSets, {
    selector: (item) => item.name,
    tiebreakers: [byLengthAsc],
  }), [previewSets]);

  // Get filtered sets based on search and category
  const filteredSets = useMemo(() => {
    let sets = previewSets;
    
    // Apply search filter if query exists
    if (props.searchQuery) {
      const results = searchIndex.find(props.searchQuery);
      console.log('>>> ', props.searchQuery, results);
      sets = results.map(result => result.item);
    }
    
    // Apply category and other filters
    return sets
      .sort((a, b) => Number(favSets?.includes(b.prefix) ?? false) - Number(favSets?.includes(a.prefix) ?? false))
      .filter(set => set.category !== 'Archive / Unmaintained')
      .filter(set => category === 'all' || set.category === category)
      .filter(set => !set.hidden);
  }, [previewSets, props.searchQuery, category, favSets, searchIndex]);

  const categories = useMemo(() => {
    return [...new Set(previewSets
      .filter(set => set.category !== 'Archive / Unmaintained')
      .filter(set => !set.hidden)
      .map(set => set.category)
    )];
  }, [previewSets]);

  const toggleSet = (set: IconifySetPreview) => {
    setChosenSets(prev => prev.includes(set)
      ? prev.filter(s => s !== set)
      : [...prev, set]
    );
  };

  const toggleFav = (set: IconifySetPreview) => {
    emit<IconFavoriteToggle>(
      'ICON_FAVORITE_TOGGLE',
      set.prefix,
      !favSets?.includes(set.prefix)
    );
    setFavSets(prev => prev.includes(set.prefix)
      ? prev.filter(s => s !== set.prefix)
      : [...prev, set.prefix]
    );
  };

  // Request icon favorites
  useEffect(() => {
    emit<IconFavoriteReq>('ICON_FAVORITE_REQ');
  }, []);

  // Handle icon favorite updates
  useEffect(() =>
    on<IconFavoriteRes>('ICON_FAVORITE_RES', setFavSets)
  , []);

  // Load icon sets when browsing ui is shown
  useEffect(() => {
    (async () => {
      const sets = await getPreviewSets();
      if (sets) setPreviewSets(sets);
    })();
  }, []);

  // Handle escape key (deselect all sets)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setChosenSets([]);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      outline: 'none',
    }}>
      <div style={{ 
        display: 'grid', 
        overflow: 'auto', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        scrollbarWidth: 'none',
        paddingBottom: 0,
        padding: 12,
        flex: 1, 
        gap: 12,
      }}>
        {filteredSets.map(set =>
          <IconSet
            key={set.prefix}
            set={set}
            onSelect={toggleSet}
            onFavorite={toggleFav}
            selected={chosenSets.includes(set)}
            favorited={favSets?.includes(set.prefix)}
            installed={props.installedSets.includes(set.prefix)}
          />
        )}
      </div>
      <Flex
        gap="2"
        direction="row"
        style={{
          borderTop: '1px solid var(--figma-color-border)',
          padding: '12px',
        }}>
        <Button variant="secondary" onClick={props.onClose}>
          Back
        </Button>
        <Select.Root
          value={category}
          onValueChange={setCategory}>
          <Select.Trigger className="no-first-span-overflow" style={{
            width: 'auto',
            maxWidth: 123,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}/>
          <Select.Content
            position="popper"
            side="top"
            alignOffset={-28}>
            <Select.Item value="all">
              All Categories
            </Select.Item>
            {categories.map(category => (
              <Select.Item key={category} value={category}>
                {category}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <div style={{flex: 1}}/>
        <Button
          variant="primary"
          disabled={!chosenSets.length}
          onClick={() => props.onSubmit(chosenSets)}>
          {screen.width >= 308
            ? `Import (${chosenSets.length} set${chosenSets.length === 1 ? '' : 's'})`
            : `Import (${chosenSets.length})`}
        </Button>
      </Flex>
    </div>
  );
}
