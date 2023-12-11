import {loadIcons} from '@iconify/react';

export async function loadIconSet (
  iconSet: string,
  onProgress: (value: number) => void,
): Promise<string[]> {
  if (!iconSet) return;
  const host = 'https://api.iconify.design';
  const res = await fetch(`${host}/collection?prefix=${iconSet}`);
  const val = await res.json();
  const set = val.uncategorized;
  const list = set.map((icon: string) => `${iconSet}:${icon}`);
  return new Promise((resolve, _reject) => {
    loadIcons(list, (_loaded, _missing, pending, _unsubscribe) => {
      onProgress(Math.round((_loaded.length / list.length) * 100));
      if (pending.length) return;
      resolve(list);
    });
  });
};
