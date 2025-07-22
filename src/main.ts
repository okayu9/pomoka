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

function getPlayIcon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>`;
}

function getPauseIcon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
  </svg>`;
}

function getResetIcon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
  </svg>`;
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
    startBtn.innerHTML = getPlayIcon();
    startBtn.setAttribute('aria-label', 'スタート');
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
  } else if (state === 'work' || state === 'break') {
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resetBtn.disabled = false;
  } else if (state === 'paused') {
    startBtn.innerHTML = getPlayIcon();
    startBtn.setAttribute('aria-label', '再開');
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
          <button id="start-btn" class="p-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors w-16 h-16 flex items-center justify-center" aria-label="スタート">
            ${getPlayIcon()}
          </button>
          <button id="pause-btn" class="p-4 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors w-16 h-16 flex items-center justify-center" disabled aria-label="一時停止">
            ${getPauseIcon()}
          </button>
          <button id="reset-btn" class="p-4 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors w-16 h-16 flex items-center justify-center" disabled aria-label="リセット">
            ${getResetIcon()}
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