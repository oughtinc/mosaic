export function pickRandomItemFromArray(arr) {
  console.log("HERE IN pickRandomItemFromArray");
  const randomIndex = Math.floor(Math.random() * (arr.length));
  return arr[randomIndex];
}
