import {h} from 'preact';
import {useExport} from 'interface/hooks/useExport';

export function Export() {  
  useExport();
  return (
    <div className="page">
      <form onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const target = data.get('target').toString();
        parent.postMessage({pluginMessage: {type: 'export', payload: target}}, '*');
      }}>
        <h4>Choose Components</h4>
        <div>
          <label>
            <input type="radio" name="target" value="all" defaultChecked/>
            Entire Document
          </label>
          <label>
            <input type="radio" name="target" value="page"/>
            Current Page
          </label>
          <label>
            <input type="radio" name="target" value="selected"/>
            Selection
          </label>
        </div>
        <input type="submit" value="Export Components"/>
      </form>
    </div>
  );
}
