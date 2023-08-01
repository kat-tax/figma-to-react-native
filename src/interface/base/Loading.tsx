import {h} from 'preact';
import {LoadingIndicator} from '@create-figma-plugin/ui';

export function Loading() {
  return (
    <div className="center fill">
      <LoadingIndicator/>
    </div>
  );
}
