import {useState} from 'react';
import {Disclosure} from 'interface/figma/ui/disclosure';

import {ProjectListPageRow} from './ProjectListPageRow';
import {ProjectListPageCell} from './ProjectListPageCell';

import type {ProjectComponentEntry, ProjectComponentLayout} from 'types/project';
import type {ComponentDiffs} from 'interface/hooks/useGitDiffs';

interface ProjectListPageProps {
  title: string;
  layout: ProjectComponentLayout;
  entries?: ProjectComponentEntry[],
  diffs: ComponentDiffs;
  onSelect: (id: string) => void;
  onSelectWithDiff: (componentKey: string) => void;
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
      {props.layout === 'list' ? (
        props?.entries?.map(entry => (
          <ProjectListPageRow
            key={entry.item.key}
            entry={entry}
            page={props.title}
            diff={props.diffs[entry.item.key] || [0, 0]}
            onSelect={props.onSelect}
            onSelectWithDiff={props.onSelectWithDiff}
          />
        ))
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          padding: '4px 12px 12px',
          gap: 12,
        }}>
          {props?.entries?.map(entry => (
            <ProjectListPageCell
              key={entry.item.key}
              page={props.title}
              diff={props.diffs[entry.item.key] || [0, 0]}
              entry={entry}
              onSelect={props.onSelect}
              onSelectWithDiff={props.onSelectWithDiff}
            />
          ))}
        </div>
      )}
    </Disclosure>
  );
}
