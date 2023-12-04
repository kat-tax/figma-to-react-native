import PhotoAlbum from 'react-photo-album';
import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks';

import type {Photo} from 'react-photo-album';
import type {ComponentBuild} from 'types/component';

interface ProjectAssetsProps {
  build: ComponentBuild,
  searchMode: boolean,
  searchQuery: string,
}

export function ProjectAssets(props: ProjectAssetsProps) {
  const [list, setList] = useState<Photo[]>([]);

  useEffect(() => {
    if (!props?.build?.assets) return;
    const list = Object.values(props.build.assets).map(asset => ({
      alt: asset.name,
      src: asset.embed,
      width: asset.width,
      height: asset.height,
    }));
    setList(list);
  }, [props.build]);

  return (
    <PhotoAlbum
      layout="rows"
      targetRowHeight={150}
      padding={20}
      spacing={10}
      photos={list}
      renderPhoto={({imageProps: {src, alt, style}}) => (
        <img
          alt={alt}
          src={src}
          style={style as any}
        /> as any
      )}
    />
  );
}
