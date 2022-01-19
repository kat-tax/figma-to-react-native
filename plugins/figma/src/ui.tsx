import './ui.css';
import React from 'react';
import ReactDOM from 'react-dom';
import {useCode} from 'hooks/useCode';
import {useEditor} from 'hooks/useEditor';

function ComponentViewer() {
  const code = useCode();
  const {Editor, isLoading} = useEditor();
  return (
    <section>
      <Editor/>
      {isLoading &&
        <div className="loading"/>
      }
      {!code && !isLoading &&
        <div className="hint">
          Please select a component
        </div>
      }
    </section>
  )
}

ReactDOM.render(
  <ComponentViewer/>,
  document.getElementById('app'),
);
