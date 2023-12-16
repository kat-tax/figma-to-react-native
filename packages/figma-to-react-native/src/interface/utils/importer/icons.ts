import {loadIcons} from '@iconify/react';

export async function loadIconSet(
  iconSet: string,
  onProgress: (value: number) => void,
): Promise<string[]> {
  if (!iconSet) return;
  const host = 'https://api.iconify.design';
  const res = await fetch(`${host}/collection?prefix=${iconSet}`);
  const val = await res.json();
  const set = filterIconsBySuffix(
    '',
    val.suffixes,
    val.uncategorized,
  );

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