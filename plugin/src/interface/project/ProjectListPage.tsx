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
      {props.layout === 'list' ? (
        props?.entries?.map(entry => (
          <ProjectListPageRow
            key={entry.item.key}
            entry={entry}
            page={props.title}
            onSelect={props.onSelect}
          />
        ))
      ) : (
        <div style={{
          display: 'grid',
          overflow: 'auto',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          scrollbarWidth: 'none',
          padding: '4px 12px 12px',
          gap: 12,
        }}>
          {props?.entries?.map(entry => (
            <ProjectListPageCell
              key={entry.item.key}
              entry={entry}
              page={props.title}
              onSelect={props.onSelect}
            />
          ))}
        </div>
      )}
    </Disclosure>
  );
}
