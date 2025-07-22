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
  const playPauseBtn = document.getElementById('play-pause-btn') as HTMLButtonElement;
  const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;

  if (state === 'idle') {
    playPauseBtn.innerHTML = getPlayIcon();
    playPauseBtn.setAttribute('aria-label', 'スタート');
    playPauseBtn.disabled = false;
    resetBtn.disabled = true;
  } else if (state === 'work' || state === 'break') {
    playPauseBtn.innerHTML = getPauseIcon();
    playPauseBtn.setAttribute('aria-label', '一時停止');
    playPauseBtn.disabled = false;
    resetBtn.disabled = false;
  } else if (state === 'paused') {
    playPauseBtn.innerHTML = getPlayIcon();
    playPauseBtn.setAttribute('aria-label', '再開');
    playPauseBtn.disabled = false;
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

function showResetDialog(): void {
  const dialog = document.getElementById('reset-dialog');
  if (dialog) {
    dialog.classList.remove('hidden');
  }
}

function hideResetDialog(): void {
  const dialog = document.getElementById('reset-dialog');
  if (dialog) {
    dialog.classList.add('hidden');
  }
}

function initializeApp(): void {
  app.innerHTML = `
    <div class="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-white p-4 lg:p-8">
      <div class="text-center mb-8 lg:mb-0 lg:mr-12 relative">
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
          <div id="time-display" class="absolute inset-0 flex items-center justify-center text-5xl lg:text-6xl font-mono font-bold text-gray-800">25:00</div>
        </div>
      </div>
      
      <div class="flex flex-row lg:flex-col justify-center items-center gap-6 lg:gap-8">
        <button id="play-pause-btn" class="p-4 lg:p-6 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center" aria-label="スタート">
          ${getPlayIcon()}
        </button>
        <button id="reset-btn" class="p-4 lg:p-6 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center" disabled aria-label="リセット">
          ${getResetIcon()}
        </button>
      </div>
      
      <!-- リセット確認ダイアログ -->
      <div id="reset-dialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
        <div class="bg-white rounded-lg p-6 mx-4 max-w-sm w-full">
          <div class="text-center">
            <div class="text-lg font-semibold text-gray-800 mb-4">タイマーをリセットしますか？</div>
            <div class="flex justify-center gap-4">
              <button id="confirm-reset" class="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                リセット
              </button>
              <button id="cancel-reset" class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">
                キャンセル
              </button>
            </div>
          </div>
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

  // Play/Pause ボタンのイベントリスナー
  document.getElementById('play-pause-btn')?.addEventListener('click', () => {
    const state = timer.getState();
    if (state === 'idle' || state === 'paused') {
      timer.start();
    } else if (state === 'work' || state === 'break') {
      timer.pause();
    }
  });

  // リセットボタンのイベントリスナー（確認ダイアログ表示）
  document.getElementById('reset-btn')?.addEventListener('click', showResetDialog);
  
  // ダイアログのイベントリスナー
  document.getElementById('confirm-reset')?.addEventListener('click', () => {
    hideResetDialog();
    timer.reset();
  });
  
  document.getElementById('cancel-reset')?.addEventListener('click', hideResetDialog);
  
  // ダイアログ外をクリックした時のイベントリスナー
  document.getElementById('reset-dialog')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      hideResetDialog();
    }
  });
  
  // 初期状態のプログレスバーを設定
  updateProgressCircle(25 * 60);
}

initializeApp();