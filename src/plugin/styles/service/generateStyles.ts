import {F2RN_STYLEGEN_API} from 'config/env';

import type {ParseStyles} from 'types/parse';

export async function generateStyles(node: SceneNode): Promise<ParseStyles> {
  // Generate CSS from node
  const css = await node.getCSSAsync();

  // Send CSS file to service
  const output = await fetch(F2RN_STYLEGEN_API, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(css),
  });

  // Parse response and return stylesheet
  const data = await output.json();
  return data.style;
}
