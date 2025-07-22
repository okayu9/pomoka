import './style.css'
import { PomodoroTimer } from './timer'

const app = document.querySelector<HTMLDivElement>('#app')!

let timer: PomodoroTimer;
let flashInterval: number | undefined;

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateDisplay(timeLeft: number): void {
  const display = document.getElementById('time-display');
  if (display) {
    display.textContent = formatTime(timeLeft);
  }
}

function updateButtons(state: string): void {
  const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
  const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
  const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;

  if (state === 'idle') {
    startBtn.textContent = 'スタート';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
  } else if (state === 'work' || state === 'break') {
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resetBtn.disabled = false;
  } else if (state === 'paused') {
    startBtn.textContent = '再開';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = false;
  }
}

function updateStateDisplay(state: string): void {
  const stateDisplay = document.getElementById('state-display');
  if (stateDisplay) {
    switch (state) {
      case 'work':
        stateDisplay.textContent = '作業中';
        stateDisplay.className = 'text-2xl font-bold text-red-600';
        break;
      case 'break':
        stateDisplay.textContent = '休憩中';
        stateDisplay.className = 'text-2xl font-bold text-green-600';
        break;
      case 'paused':
        stateDisplay.textContent = '一時停止';
        stateDisplay.className = 'text-2xl font-bold text-gray-600';
        break;
      default:
        stateDisplay.textContent = '待機中';
        stateDisplay.className = 'text-2xl font-bold text-gray-600';
    }
  }
}

function flashScreen(): void {
  if (flashInterval) return;
  
  let count = 0;
  const maxFlashes = 6;
  
  flashInterval = setInterval(() => {
    document.body.classList.toggle('bg-yellow-200');
    count++;
    
    if (count >= maxFlashes) {
      clearInterval(flashInterval);
      flashInterval = undefined;
      document.body.classList.remove('bg-yellow-200');
    }
  }, 300);
}

function initializeApp(): void {
  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">Pomoka</h1>
        
        <div class="text-center mb-8">
          <div id="state-display" class="text-2xl font-bold text-gray-600 mb-4">待機中</div>
          <div id="time-display" class="text-6xl font-mono font-bold text-gray-800">25:00</div>
        </div>
        
        <div class="flex justify-center gap-4">
          <button id="start-btn" class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            スタート
          </button>
          <button id="pause-btn" class="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors" disabled>
            一時停止
          </button>
          <button id="reset-btn" class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors" disabled>
            リセット
          </button>
        </div>
      </div>
    </div>
  `;

  timer = new PomodoroTimer({
    workMinutes: 25,
    breakMinutes: 5,
    onTick: updateDisplay,
    onStateChange: (state) => {
      updateButtons(state);
      updateStateDisplay(state);
    },
    onComplete: flashScreen
  });

  document.getElementById('start-btn')?.addEventListener('click', () => timer.start());
  document.getElementById('pause-btn')?.addEventListener('click', () => timer.pause());
  document.getElementById('reset-btn')?.addEventListener('click', () => timer.reset());
}

initializeApp();