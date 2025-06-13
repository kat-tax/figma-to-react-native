import {useState} from 'react';
import {Disclosure} from 'interface/figma/ui/disclosure';

import {ProjectListPageItem} from './ProjectListPageItem';

import type {ProjectComponentEntry} from 'types/project';

interface ProjectListPageProps {
  title: string;
  entries?: ProjectComponentEntry[],
  component?: JSX.Element,
  onSelect: (id: string) => void;
}

export function ProjectListPage(props: ProjectListPageProps) {
  const [isExpanded, setExpanded] = useState<boolean>(true);
  if (!props?.entries?.length) return null;
  return (
    <Disclosure
      style={{width: '100%'}}
      title={props.title}
      open={isExpanded}
      onClick={() => setExpanded(!isExpanded)}>
      {props?.component}
      {props?.entries?.map(entry =>
        <ProjectListPageItem
          key={entry.item.key}
          entry={entry}
          page={props.title}
          onSelect={props.onSelect}
        />
      )}
    </Disclosure>
  );
}
