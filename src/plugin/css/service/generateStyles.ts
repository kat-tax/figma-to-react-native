import type {ParseStyles} from 'types/parse';

export async function generateStyles(node: SceneNode): Promise<ParseStyles> {
  // TODO: send preview image of node to assist AI in generating styles
  // const img = await node.exportAsync({format: 'PNG'});
  const css = await node.getCSSAsync();

  // Build CSS file
  let body = '.root { ';
  for (const [k, v] of Object.entries(css)) {
    body += `${k}: ${v}; `;
  }
  body += ' }';

  // Send CSS file to service
  const endpoint = 'http://localhost:8000';
  const output = await fetch(endpoint, {
    body,
    method: 'POST',
    headers: {
      'Content-Type': 'text/css',
    }
  });

  // Parse response and return styles
  const data = await output.json();
  console.log(data);
  return data.declarations.root.style;
}
