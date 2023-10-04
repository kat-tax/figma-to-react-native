import type {ParseStyles} from 'types/parse';

const STYLES_API = 'http://localhost:8000';

export async function generateStyles(node: SceneNode): Promise<ParseStyles> {
  // Get CSS from node
  const css = await node.getCSSAsync();

  // Send CSS file to service
  const output = await fetch(STYLES_API, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(css),
  });

  // Parse response and return styles
  const styles = await output.json();
  console.log(css, styles);
  return styles;
}
