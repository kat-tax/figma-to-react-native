import {Icon} from '@iconify/react';
import {IconButton, Flex} from 'figma-kit';
import {IconStar16, IconStarFilled16, Text} from 'figma-ui';

import type {IconifySetPreview} from 'interface/icons/lib/iconify';

interface IconSetProps {
  set: IconifySetPreview,
  selected: boolean,
  favorited: boolean,
  installed: boolean,
  onSelect: (set: IconifySetPreview) => void,
  onFavorite: (set: IconifySetPreview) => void,
}

export function IconSet({
  set,
  favorited,
  installed,
  selected,
  onSelect,
  onFavorite,
}: IconSetProps) {
  return (
    <div 
      key={set.prefix}
      onClick={(e) => {
        if (e.altKey) {
          window.open(`https://icones.js.org/collection/${set.prefix}`, '_blank');
        } else if (!installed) {
          onSelect(set);
        }
      }}
      style={{
        opacity: installed ? 0.5 : 1,
        padding: '12px', 
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--figma-color-bg)',
        borderRadius: '6px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: selected
          ? 'var(--figma-color-bg-brand)'
          : 'var(--figma-color-border)',
      }}>
      <Flex direction="row" justify="space-between">
        <div style={{flex: 1}}>
          <Text style={{fontWeight: 'bold', color: 'var(--figma-color-text)', marginBottom: '4px'}}>
            {set.name}
          </Text>
          <div style={{fontSize: '12px', marginBottom: '12px', color: 'var(--figma-color-text-secondary)'}}>
            {set.total} icons
          </div>
        </div>
        <IconButton
          size="medium"
          aria-label={favorited ? 'Favorited' : 'Favorite'}
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(set);
          }}>
          {favorited
            ? <IconStarFilled16 color="secondary"/>
            : <IconStar16 color="tertiary"/>
          }
        </IconButton>
      </Flex>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '4px',
      }}>
        {(() => {
          const samples = [...set.samples];
          while (samples.length < 6)
            samples.push(...set.samples.slice(0, Math.min(6 - samples.length, set.samples.length)));
          return samples.slice(0, 6).map((name, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--figma-color-bg-secondary)',
                borderRadius: '4px',
                padding: '8px',
                height: '32px'
              }}>
              <Icon 
                icon={`${set.prefix}:${name}`} 
                color="var(--figma-color-text)"
                width={18} 
                height={18}
              />
            </div>
          ));
        })()}
      </div>
    </div>
  );
}
