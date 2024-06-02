import {emit, once} from '@create-figma-plugin/utilities';
import {diff} from 'deep-object-diff';
import {F2RN_STYLEGEN_API} from 'config/env';
import {getColor} from './colors';

import type {EventStyleGenReq, EventStyleGenRes} from 'types/events';
import type {ParseStyleSheet, ParseVariantData} from 'types/parse';

let _remoteStyleGenOnly = false;

type StyleSheet = Record<string, StyleClass>;
type StyleClass = {[key: string]: string};

export async function getStyleSheet(
  nodes: Set<string>,
  cssVars: string,
  variants?: ParseVariantData,
): Promise<ParseStyleSheet> {
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
        for (const k in diff) {
          if (diff[k] === undefined) {
            diff[k] = 'unset';
          }
        }
        if (diff && Object.keys(diff).length > 0) {
          css[vid] = diff;
        }
      }
    }
  }

  // Convert CSS
  css['*'] = {':root': cssVars};
  const output = await convertStyles(css);
  
  // Build Stylesheet
  const stylesheet:ParseStyleSheet = {};

  for (const key in output) {
    const style = output[key]?.style;
    if (style) {
      const id = key.slice(1).replace(/\-/g, ':');
      const props = {};
      for (const k in style) {
        if (k === 'display' && style[k] === 'flex') {
          if (!style['flexDirection']) {
            props['flexDirection'] = 'row';
          }
        } else {
          props[k] = style[k];
        }
      }
      stylesheet[id] = props;
    }
  }

  return stylesheet;
}

export async function getVariables(): Promise<string> {
  const variables = await figma.variables.getLocalVariablesAsync();
  const getVal = (v: Variable) => {
    const value = Object.values(v.valuesByMode)[0];
    switch (typeof value) {
      case 'object': {
        if ('type' in value) {
          return getVal(figma.variables.getVariableById(value.id));
        } else if ('r' in value) {
          const {r, g, b} = value;
          if ('a' in value) {
            const {a} = value;
            return getColor({r, g, b}, a);
          }
          return getColor({r, g, b});
        }
      }
      default: {
        return value;
      }
    }
  };

  return variables.map(v => v?.codeSyntax?.WEB
    ? `${v.codeSyntax.WEB.slice(4,-1)}: ${getVal(v)};`
    : null).filter(Boolean).join('\n');
}

async function convertStyles(css: StyleSheet): Promise<Record<string, any>> {
  // Headless mode needs to use the remote api (or local mode failed)
  if (_remoteStyleGenOnly || figma.mode === 'codegen') {
    return await convertStylesRemote(css);
  // Attempt to use the local stylegen from the interface
  } else {
    try {
      return await convertStylesLocal(css);
    } catch (e) {
      console.warn('Failed to use local stylegen, falling back to remote');
      _remoteStyleGenOnly = true;
      return await convertStylesRemote(css);
    }
  }
}

async function convertStylesLocal(css: StyleSheet): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    try {
      const timeout = setTimeout(() => {
        _remoteStyleGenOnly = true;
        reject(new Error('STYLE_GEN_TIMEOUT'));
      }, 5000);
      once<EventStyleGenRes>('STYLE_GEN_RES', async (stylesheet) => {
        clearTimeout(timeout);
        resolve(stylesheet.declarations);
      });
      emit<EventStyleGenReq>('STYLE_GEN_REQ', css);
    } catch (e) {
      reject(e);
    }
  });
}

async function convertStylesRemote(css: StyleSheet): Promise<Record<string, any>> {
  const response = await fetch(F2RN_STYLEGEN_API, {
    body: JSON.stringify(css),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
}

function diffStyles(a: StyleClass, b: StyleClass) {
  return diff(a, b) as StyleClass;
}
