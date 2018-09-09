export default function howMuchTimeLeftOnTimerInMs() {
  const curTimeInMs = Date.now();
  const timeLeftInMs = localStorage.getItem('mosaic-timer') - curTimeInMs;
  return timeLeftInMs;
}
