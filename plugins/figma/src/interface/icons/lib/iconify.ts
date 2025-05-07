import {loadIcons, getIcon} from '@iconify/react';
import {ICONIFY_HOST} from './consts';

export type IconifySetPreview = {
  prefix: string;
  name: string;
  total: number;
  height: number;
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
  list: {
    // Icon name => Icon SVG
    [icon: string]: string,
  },
}

export async function getPreviewSets(): Promise<Array<IconifySetPreview>> {
  const res = await fetch(`${ICONIFY_HOST}/collections`);
  const val = await res.json();
  return Object.entries(val)
    .map(([prefix, data]: [string, any]) => ({
      prefix,
      name: data.name,
      total: data.total,
      height: data.height || 32,
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
  const ids = await getIconIds(sets.map(set => set.prefix));
  const svgs = await getIconSvgs(ids, onProgress);
  return Object.entries(svgs).reduce((acc, [prefix, list]) => {
    const set = sets.find(set => set.prefix === prefix);
    if (!set) return acc;
    acc[prefix] = {
      name: set.name,
      size: set.height,
      mode: '',
      list,
    };
    return acc;
  }, {});
}

async function getIconIds(prefixes: string[]): Promise<string[]> {
  return await Promise.all(prefixes.map(async (prefix) => {
    const res = await fetch(`${ICONIFY_HOST}/collection?prefix=${prefix}`);
    const val = await res.json();
    const categorized = Object.values(val.categories || {}).flat() as string[];
    const uncategorized = val.uncategorized || [];
    const allIcons = new Set([...categorized, ...uncategorized]);
    const set = getIconList('', val.suffixes, Array.from(allIcons));
    console.log('>>> [icons]', allIcons.size);
    return set.map(icon => `${prefix}:${icon}`);
  })).then(ids => ids.flat());
}

async function getIconSvgs(
  iconIds: string[],
  onProgress: (value: number) => void,
): Promise<{
  [prefix: string]: {
    [icon: string]: string,
  },
}> {
  return new Promise((resolve, _reject) => {
    loadIcons(iconIds, (_loaded, _missing, pending, _unsubscribe) => {
      onProgress(Math.round((_loaded.length / iconIds.length) * 100));
      if (pending.length) return;
      resolve(_loaded.reduce((acc, icon) => {
        acc[icon.prefix] = acc[icon.prefix] || {};
        acc[icon.prefix][icon.name] = getIcon(`${icon.prefix}:${icon.name}`)?.body;
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
