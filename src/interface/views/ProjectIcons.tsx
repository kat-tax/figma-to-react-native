import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {NotFound} from 'interface/base/NotFound';
import PhotoAlbum from 'react-photo-album';

import type {Photo} from 'react-photo-album';

interface ProjectIconsProps {
  iconSet: string;
}

export function ProjectIcons(props: ProjectIconsProps) {
  const [list, setList] = useState<Photo[]>([]);

  useEffect(() => {
    
  }, [props.iconSet]);

  return true? <NotFound message="No icons found"/> : (
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
