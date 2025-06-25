import {loadIcons, getIcon} from '@iconify/react';
import {ICONIFY_HOST} from './consts';

import type {IconifyIcon} from '@iconify/react';

export type IconifySetPreview = {
  prefix: string;
  name: string;
  total: number;
  height: number;
  palette: boolean;
  samples: string[];
  category: string;
  hidden: boolean;
}

export type IconifySetPayload = {
  [prefix: string]: IconifySetData,
}

export type IconifySetData = {
  name: string,
  mode: string,
  size: number,
  view: number,
  fill: boolean,
  list: {
    // Icon name => Icon SVG
    [icon: string]: IconifyIcon,
  },
}

export async function getPreviewSets(prefix?: string): Promise<Array<IconifySetPreview>> {
  const res = await fetch(`${ICONIFY_HOST}/collections${prefix ? `?prefix=${prefix}` : ''}`);
  const val = await res.json();
  return Object.entries(val)
    .map(([prefix, data]: [string, any]) => ({
      prefix,
      name: data.name,
      total: data.total,
      height: data.height || 32,
      palette: data.palette || false,
      samples: data.samples,
      category: data.category,
      hidden: data.hidden,
    }))
    .sort((a, b) => b.total - a.total);
}

export async function loadIconSets(
  sets: IconifySetPreview[],
  onProgress: (value: number) => void,
): Promise<IconifySetPayload> {
  if (!sets.length) return;
  // Workaround to get SVG dimensions
  const res = await Promise.all(sets.map(set => fetch(`${ICONIFY_HOST}/${set.prefix}.json?icons`)));
  const data = await Promise.all(res.map(r => r.json()));
  const sizes: Record<string, {size: number}> = data.reduce((acc, item) => {
    acc[item.prefix] = item.width || item.height || 256;
    return acc;
  }, {});

  const ids = await Promise.all(sets.map(set => getIconIds(set.prefix))).then(ids => ids.flat());
  const svgs = await getIconSvgs(ids, onProgress);
  return Object.entries(svgs).reduce((acc, [prefix, list]) => {
    const set = sets.find(set => set.prefix === prefix);
    if (!set) return acc;
    acc[prefix] = {
      name: set.name,
      size: set.height,
      view: sizes[prefix] || 256,
      fill: !set.palette,
      mode: 'Normal',
      list,
    };
    return acc;
  }, {});
}

export async function getIconIds(prefix: string): Promise<string[]> {
  const res = await fetch(`${ICONIFY_HOST}/collection?prefix=${prefix}`);
  const val = await res.json();
  const categorized = Object.values(val.categories || {}).flat() as string[];
  const uncategorized = val.uncategorized || [];
  const allIcons = new Set([...categorized, ...uncategorized]);
  const set = getIconList('', val.suffixes, Array.from(allIcons));
  return set.map(icon => `${prefix}:${icon}`);
}

async function getIconSvgs(
  iconIds: string[],
  onProgress: (value: number) => void,
): Promise<{
  [prefix: string]: {
    [icon: string]: IconifyIcon,
  },
}> {
  return new Promise((resolve, _reject) => {
    loadIcons(iconIds, (_loaded, _missing, pending, _unsubscribe) => {
      onProgress(Math.round((_loaded.length / iconIds.length) * 100));
      if (pending.length) return;
      resolve(_loaded.reduce((acc, icon) => {
        acc[icon.prefix] = acc[icon.prefix] || {};
        acc[icon.prefix][icon.name] = getIcon(`${icon.prefix}:${icon.name}`);
        return acc;
      }, {}));
    });
  });
}

function getIconList(
  mode: string,
  suffixes: Record<string, string>,
  uncategorized: string[],
): string[] {
  return suffixes ? filterIconsBySuffix(
    mode,
    suffixes,
    uncategorized,
  ) : uncategorized;
}

function filterIconsBySuffix(
  suffix: string,
  suffixes: Record<string, string>,
  items: string[],
): string[] {
  // Suffix is an empty string, filter out all suffixes
  if (suffix === '') {
    return items.filter(i => !Object.keys(suffixes).filter(Boolean).some(s => i.endsWith(s)));
  // Suffix matches in the suffixes object, use specified suffix
  } else if (suffixes.hasOwnProperty(suffix)) {
    return items.filter(i => i.endsWith(suffix));
  // If the suffix is not in the suffixes object, return the original array
  } else {
    return items;
  }
}
