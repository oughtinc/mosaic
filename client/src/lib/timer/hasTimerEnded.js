import howMuchTimeLeftOnTimer from './howMuchTimeLeftOnTimer';

export default function hasTimerEnded() {
  return howMuchTimeLeftOnTimer() <= 0;
}
