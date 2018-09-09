export default function hasTimerStarted() {
  const timerValue = localStorage.getItem('mosaic-timer');
  if (
    timerValue !== undefined
    &&
    timerValue !== null
    &&
    !isNaN(Number(timerValue))
  ) return true;
  return false;
}
