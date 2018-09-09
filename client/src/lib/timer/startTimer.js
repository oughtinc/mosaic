export default function startTimer(durationInMs: number) {
  localStorage.setItem('mosaic-timer', Date.now() + durationInMs);
}
