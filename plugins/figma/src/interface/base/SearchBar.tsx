import {Fragment} from 'react';
import {SearchTextbox, IconButton, IconCross32} from 'figma-ui';

interface SearchBarProps {
  searchQuery: string,
  setSearchQuery: (value: string) => void,
  setSearchMode: (value: boolean) => void,
}

export function SearchBar(props: SearchBarProps) {
  return (
    <Fragment>
      <SearchTextbox
        style={{width: '100%'}}
        placeholder="Find..."
        value={props.searchQuery}
        onInput={(e) => {
          const {value} = e.currentTarget;
          props.setSearchQuery(value);
          if (!value) {
            props.setSearchMode(false);
          }
        }}
      />
      {!Boolean(props.searchQuery) &&                    
        <IconButton
          style={{margin: '5px 6.5px'}}
          onClick={() => props.setSearchMode(false)}>
          <IconCross32 color="secondary"/>
        </IconButton>
      }
    </Fragment>
  );
}
