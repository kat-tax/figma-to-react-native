import {diff} from 'deep-object-diff';
import {F2RN_STYLEGEN_API} from 'config/env';

import type {ParseStyleSheet, ParseVariantData} from 'types/parse';

type StyleSheet = Record<string, StyleClass>;
type StyleClass = {[key: string]: string};

export async function convertStyles(nodes: Set<string>, variants?: ParseVariantData): Promise<ParseStyleSheet> {
  // Generate CSS from nodes
  let css: StyleSheet = {};
  for await (const id of nodes) {
    const node = figma.getNodeById(id);
    css[id] = await node.getCSSAsync();
  }

  // Generate CSS from variant mappings
  if (variants?.mapping) {
    for await (const id of Object.keys(variants.mapping)) {
      for await (const [bid, vid] of Object.entries(variants.mapping[id])) {
        const vnode = figma.getNodeById(vid);
        const vcss = await vnode.getCSSAsync();
        const diff = diffStyles(css[bid], vcss);
        if (diff && Object.keys(diff).length > 0) {
          css[vid] = diff;
        }
      }
    }
  }

  // Send CSS to service
  const response = await fetch(F2RN_STYLEGEN_API, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(css),
  });
  
  // Parse response and build stylesheet
  const output = await response.json();
  const stylesheet: ParseStyleSheet = {};
  for (const key in output) {
    const style = output[key]?.style;
    if (style) {
      const id = key.slice(1).replace(/\-/g, ':');
      stylesheet[id] = style;
    }
  }

  return stylesheet;
}

function diffStyles(a: StyleClass, b: StyleClass) {
  return diff(a, b) as StyleClass;
}
