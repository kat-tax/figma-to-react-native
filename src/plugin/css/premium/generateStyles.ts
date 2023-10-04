import type {ParseStyles} from 'types/parse';

export async function generateStyles(node: SceneNode): Promise<ParseStyles> {
  const css = await node.getCSSAsync();

  let body = '.root { ';
  for (const [k, v] of Object.entries(css)) {
    body += `${k}: ${v}; `;
  }
  body += ' }';
  console.log(body);
  
  const output = await fetch('http://localhost:8000', {
    body,
    method: 'POST',
    headers: {
      'Content-Type': 'text/css',
    }
  });

  const data = await output.json();

  return data.declarations.root.style;
}
