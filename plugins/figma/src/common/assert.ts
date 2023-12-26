export function areMapsEqual<K, V>(map1: Map<K, V>, map2: Map<K, V>): boolean {
  // Check if the maps have the same size
  if (map1.size !== map2.size) {
    return false;
  }

  // Iterate over each key-value pair in the first map
  for (const [key, value] of map1) {
    // Check if the second map has the same key
    if (!map2.has(key)) {
      return false;
    }

    // Check if the values associated with the key are equal
    if (map2.get(key) !== value) {
      return false;
    }
  }

  // If all checks passed, the maps are equal
  return true;
}

export function areSetsEqual<T>(set1: Set<T>, set2: Set<T>): boolean {
  // Check if the sets have the same size
  if (set1.size !== set2.size) {
    return false;
  }

  // Iterate over each element in the first set
  for (const element of set1) {
    // Check if the second set contains the same element
    if (!set2.has(element)) {
      return false;
    }
  }

  // If all checks passed, the sets are equal
  return true;
}
