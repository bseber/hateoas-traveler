/**
 * Deep flattens a list of random items
 *
 * flatten(1, 2, 3) -> [1, 2, 3]
 * flatten([1, 2, 3]) -> [1, 2, 3]
 * flatten([1, [2, 3]]) -> [1, 2, 3]
 *
 * @param items
 * @returns {*|Array}
 */
export default function flatten(...items) {
  return items.reduce((flatList, item) => {
    if (Array.isArray(item)) {
      return [...flatList, ...flatten(...item)];
    }
    return [...flatList, item];
  }, []);
}
