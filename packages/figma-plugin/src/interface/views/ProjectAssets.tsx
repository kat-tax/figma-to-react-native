import PhotoAlbum from 'react-photo-album';
import {Fzf, byLengthAsc} from 'fzf';
import {h} from 'preact';
import {useState, useMemo, useEffect} from 'preact/hooks';
import {emit} from 'common/events';

import type {ComponentBuild, ComponentEntry} from 'types/component';
import type {EventFocusNode} from 'types/events';

interface ProjectAssetsProps {
  build: ComponentBuild,
  searchMode: boolean,
  searchQuery: string,
}

type ProjectComponentEntry = {
  item: ComponentEntry,
  positions: Set<number>,
}

export function ProjectAssets(props: ProjectAssetsProps) {
  const [list, setList] = useState<ProjectComponentEntry[]>([]);
  const hasComponents = Boolean(props?.build && props.build.roster);
  const fzfSearch = useMemo(() => {
    const entries = hasComponents ? Object.values(props.build?.roster) : [];
    return new Fzf(entries, {
      selector: (item) => `${item.page}/${item.name}`,
      tiebreakers: [byLengthAsc],
      forward: false,
    });
  }, [props?.build]);

  const select = (key: string) => {
    const data = props.build.roster?.[key];
    //const nodeId = data?.component.id;
    //if (!nodeId) return;
    //emit<EventFocusNode>('FOCUS', nodeId);
  };

  useEffect(() => {
    const entries = fzfSearch.find(props.searchQuery);
    const newList: ProjectComponentEntry[] = hasComponents
      ? Object.values(entries)
      : [];
    setList(newList);
  }, [props.build, props.searchQuery]);

  return (
    <PhotoAlbum
      layout="rows"
      photos={[]}
      renderPhoto={({imageProps: {src, alt, style}}) => (
        <img src={src} alt={alt} style={style as any}/> as any
      )}
    />
  );
}
