import {loadIcons} from '@iconify/react';

const HOST = 'https://api.iconify.design';

export type IconifySet = {
  prefix: string;
  name: string;
  total: number;
  samples: string[];
}

export async function getIconSets(): Promise<Array<IconifySet>> {
  const res = await fetch(`${HOST}/collections`);
  const val = await res.json();
  return Object.entries(val)
    .map(([prefix, data]: [string, any]) => ({
      prefix,
      name: data.name,
      total: data.total,
      samples: data.samples,
    }))
    .sort((a, b) => b.total - a.total); 
}

export async function loadIconSet(
  iconSet: string,
  onProgress: (value: number) => void,
): Promise<string[]> {
  if (!iconSet) return;
  const res = await fetch(`${HOST}/collection?prefix=${iconSet}`);
  const val = await res.json();
  const set = val.suffixes ? filterIconsBySuffix(
    '',
    val.suffixes,
    val.uncategorized,
  ) : val.uncategorized;

  const list = set.map((icon: string) => `${iconSet}:${icon}`);
  return new Promise((resolve, _reject) => {
    loadIcons(list, (_loaded, _missing, pending, _unsubscribe) => {
      onProgress(Math.round((_loaded.length / list.length) * 100));
      if (pending.length) return;
      resolve(list);
    });
  });
};

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
