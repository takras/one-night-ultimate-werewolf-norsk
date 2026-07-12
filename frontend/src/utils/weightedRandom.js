// Picks one item from a list of { weight, ... } objects, proportional to
// each item's weight (weights don't need to sum to 100).
export function weightedRandomPick(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    if (roll < item.weight) return item;
    roll -= item.weight;
  }
  return items[items.length - 1];
}
