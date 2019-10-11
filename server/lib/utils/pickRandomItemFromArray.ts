export function pickRandomItemFromArray(arr: any[]): any | undefined {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}
