import DataLoader from 'dataloader';

export function createOneToManyLoader<K, V>(
  batch: (keys: readonly K[]) => Promise<V[]>,
  getKey: (value: V) => K,
): DataLoader<K, V[]> {
  return new DataLoader<K, V[]>(async (keys) => {
    const rows = await batch(keys);
    const grouped = new Map<K, V[]>();

    for (const key of keys) {
      grouped.set(key, []);
    }

    for (const row of rows) {
      grouped.get(getKey(row))?.push(row);
    }

    return keys.map((key) => grouped.get(key) ?? []);
  });
}
