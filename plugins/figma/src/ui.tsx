import './ui.css';
import React from 'react';
import {render} from 'react-dom';
import {useEditor} from 'hooks/useEditor';

function ComponentViewer() {
  const {isLoading, content, editor} = useEditor();
  return <>
    {editor}
    {(isLoading || !content) &&
      <div className="info">
        {isLoading
          ? <div className="loading"/>
          : <div className="hint">
              Please select a component
            </div>
        }
      </div>
    }
  </>
}

render(
  <ComponentViewer/>,
  document.getElementById('app'),
);
