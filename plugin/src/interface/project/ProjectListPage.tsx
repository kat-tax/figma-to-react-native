import {useState} from 'react';
import {Disclosure} from 'interface/figma/ui/disclosure';

import {ProjectListPageRow} from './ProjectListPageRow';
import {ProjectListPageCell} from './ProjectListPageCell';

import type {ProjectComponentEntry, ProjectComponentLayout} from 'types/project';

interface ProjectListPageProps {
  title: string;
  layout: ProjectComponentLayout;
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
        props.layout === 'list' ? (
          <ProjectListPageRow
            key={entry.item.key}
            entry={entry}
            page={props.title}
            onSelect={props.onSelect}
          />
        ) : (
          <ProjectListPageCell
            key={entry.item.key}
            entry={entry}
            page={props.title}
            onSelect={props.onSelect}
          />
        )
      )}
    </Disclosure>
  );
}
