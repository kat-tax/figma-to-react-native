import React from 'react';
import {useCallback} from 'react';
import {useExport} from 'interface/hooks/useExport';

export function Export() {  
  const exportProject = useCallback((target: string) =>
    parent.postMessage({pluginMessage: {type: 'export', payload: target}}, '*'), []);

  useExport();

  return (
    <div className="page">
      <form onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const type = data.get('type').toString();
        exportProject(type);
      }}>
        <h4>Choose Components</h4>
        <div className="radio-group">
          <label>
            <input type="radio" name="type" value="all" defaultChecked/>
            Entire Document
          </label>
          <label>
            <input type="radio" name="type" value="page"/>
            Current Page
          </label>
          <label>
            <input type="radio" name="type" value="selected"/>
            Selection
          </label>
        </div>
        <input className="button" type="submit" value="Export Components"/>
      </form>
    </div>
  );
}
