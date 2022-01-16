import './ui.css';

const info = document.getElementById('info');
const hint = document.getElementById('hint');
const copy = document.getElementById('copy');
const editor = document.getElementById('editor');
const loading = document.getElementById('loading');

let CONTENT = '';
let LOADING = true;

window.onmessage = onMessage;
editor.onload = onLoad;
// copy.onclick = onCopy;

function onMessage(e: any) {
  const {type, payload} = e.data.pluginMessage;
  switch (type) {
    case 'editor-value':
      if (LOADING) editor.style.opacity = '1.0';
      CONTENT = payload;
      LOADING = !payload;
      frames['editor'].postMessage(`\n${payload}\n`, '*');
      if (LOADING) {
        info.style.display = '';
        hint.style.display = '';
      } else {
        info.style.display = 'none';
      }
      break;
  }
}

function onLoad() {
  dispatch({type: 'editor-init'});
}

function onCopy() {
  try {
    navigator.clipboard.writeText(CONTENT);
    figma.notify('Copied code to clipboard!', {timeout: 2000});
  } catch (e) {
    figma.notify('Failed to copy to clipboard.', {timeout: 2000});
  }
}

function dispatch(e: any) {
  const {type, payload} = e;
  parent.postMessage({pluginMessage: {type, payload}}, '*');
  switch (type) {
    case 'editor-init':
      loading.style.display = 'none';
      hint.style.display = 'flex';
      break;
  }
}
