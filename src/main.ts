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
  updateProgressCircle(timeLeft);
}

function updateProgressCircle(timeLeft: number): void {
  const progressCircle = document.getElementById('progress-circle') as unknown as SVGCircleElement;
  if (!progressCircle) return;
  
  const maxTime = 60 * 60; // 60分を最大値とする
  const currentTime = Math.min(timeLeft, maxTime);
  const percentage = currentTime / maxTime;
  
  // SVGの円周の長さ（2πr、r=120）
  const circumference = 2 * Math.PI * 120;
  const offset = circumference * (1 - percentage);
  
  progressCircle.style.strokeDashoffset = offset.toString();
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
  const progressCircle = document.getElementById('progress-circle');
  
  if (progressCircle) {
    switch (state) {
      case 'work':
        progressCircle.setAttribute('stroke', '#dc2626');
        break;
      case 'break':
        progressCircle.setAttribute('stroke', '#16a34a');
        break;
      case 'paused':
        progressCircle.setAttribute('stroke', '#6b7280');
        break;
      default:
        progressCircle.setAttribute('stroke', '#3b82f6');
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
    <div class="min-h-screen flex flex-col items-center justify-center bg-white">
      <div class="text-center mb-12 relative">
        <div class="relative inline-block">
          <svg width="280" height="280" class="transform -rotate-90">
            <circle
              cx="140"
              cy="140"
              r="120"
              fill="none"
              stroke="#e5e7eb"
              stroke-width="16"
            />
            <circle
              id="progress-circle"
              cx="140"
              cy="140"
              r="120"
              fill="none"
              stroke="#3b82f6"
              stroke-width="16"
              stroke-dasharray="${2 * Math.PI * 120}"
              stroke-dashoffset="0"
              stroke-linecap="round"
              class="transition-all duration-1000"
            />
          </svg>
          <div id="time-display" class="absolute inset-0 flex items-center justify-center text-6xl font-mono font-bold text-gray-800">25:00</div>
        </div>
      </div>
      
      <div class="flex justify-center gap-6">
        <button id="start-btn" class="p-6 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors w-20 h-20 flex items-center justify-center" aria-label="スタート">
          ${getPlayIcon()}
        </button>
        <button id="pause-btn" class="p-6 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors w-20 h-20 flex items-center justify-center" disabled aria-label="一時停止">
          ${getPauseIcon()}
        </button>
        <button id="reset-btn" class="p-6 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors w-20 h-20 flex items-center justify-center" disabled aria-label="リセット">
          ${getResetIcon()}
        </button>
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
  
  // 初期状態のプログレスバーを設定
  updateProgressCircle(25 * 60);
}

initializeApp();