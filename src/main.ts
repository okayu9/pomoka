import './style.css'
import { PomodoroTimer } from './timer'

const app = document.querySelector<HTMLDivElement>('#app')!

let timer: PomodoroTimer;
let flashInterval: number | undefined;
let resetHoldTimeout: number | undefined;
let resetSecondPhaseTimeout: number | undefined;
let resetProgress: number = 0;
let currentView: 'timer' | 'settings' = 'timer';

interface TimerSettings {
  workMinutes: number;
  breakMinutes: number;
}

function getSettings(): TimerSettings {
  const saved = localStorage.getItem('pomoka-settings');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fall through to defaults
    }
  }
  return { workMinutes: 25, breakMinutes: 5 };
}

function saveSettings(settings: TimerSettings): void {
  localStorage.setItem('pomoka-settings', JSON.stringify(settings));
}

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

function getSettingsIcon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
  </svg>`;
}

function getBackIcon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
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
    playPauseBtn.className = 'p-4 lg:p-6 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center';
    playPauseBtn.disabled = false;
    resetBtn.disabled = true;
  } else if (state === 'work' || state === 'break') {
    playPauseBtn.innerHTML = getPauseIcon();
    playPauseBtn.setAttribute('aria-label', '一時停止');
    playPauseBtn.className = 'p-4 lg:p-6 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center';
    playPauseBtn.disabled = false;
    resetBtn.disabled = false;
  } else if (state === 'paused') {
    playPauseBtn.innerHTML = getPlayIcon();
    playPauseBtn.setAttribute('aria-label', '再開');
    playPauseBtn.className = 'p-4 lg:p-6 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center';
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

function startResetHold(): void {
  const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
  if (!resetBtn || resetBtn.disabled) return;

  const resetProgressBar = document.getElementById('reset-progress');
  if (!resetProgressBar) return;

  resetProgress = 0;
  const holdDuration = 1000; // 1秒

  // まず即座に1/3まで進める
  resetProgressBar.style.transition = 'width 50ms ease-out';
  resetProgressBar.style.width = '33.33%';

  // 200ms後に残りの部分をゆっくり進める（長押し継続時のみ）
  resetSecondPhaseTimeout = setTimeout(() => {
    resetProgressBar.style.transition = `width ${holdDuration - 200}ms ease-out`;
    resetProgressBar.style.width = '100%';
  }, 200);

  resetHoldTimeout = setTimeout(() => {
    // 長押し完了時にリセット実行
    timer.reset();
    resetResetHold();
  }, holdDuration);
}

function resetResetHold(): void {
  if (resetHoldTimeout) {
    clearTimeout(resetHoldTimeout);
    resetHoldTimeout = undefined;
  }

  if (resetSecondPhaseTimeout) {
    clearTimeout(resetSecondPhaseTimeout);
    resetSecondPhaseTimeout = undefined;
  }

  const resetProgressBar = document.getElementById('reset-progress');
  if (resetProgressBar) {
    resetProgressBar.style.width = '0%';
    resetProgressBar.style.transition = 'width 200ms ease-out';
  }

  resetProgress = 0;
}

function showSettingsView(): void {
  currentView = 'settings';
  const settings = getSettings();
  
  app.innerHTML = `
    <div class="min-h-screen flex flex-col bg-white p-6 lg:p-8">
      <div class="flex items-center justify-between mb-8">
        <button id="back-btn" class="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center" aria-label="戻る">
          ${getBackIcon()}
        </button>
        <h1 class="text-2xl font-bold text-gray-800">設定</h1>
        <div class="w-12"></div>
      </div>
      
      <div class="max-w-md mx-auto w-full space-y-6">
        <div class="bg-gray-50 rounded-lg p-6">
          <label class="block text-sm font-medium text-gray-700 mb-3">作業時間（分）</label>
          <input 
            type="number" 
            id="work-minutes" 
            value="${settings.workMinutes}" 
            min="1" 
            max="60" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg"
          >
        </div>
        
        <div class="bg-gray-50 rounded-lg p-6">
          <label class="block text-sm font-medium text-gray-700 mb-3">休憩時間（分）</label>
          <input 
            type="number" 
            id="break-minutes" 
            value="${settings.breakMinutes}" 
            min="1" 
            max="30" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg"
          >
        </div>
        
        <button id="save-settings" class="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-medium">
          設定を保存
        </button>
      </div>
    </div>
  `;

  // Back button event listener
  document.getElementById('back-btn')?.addEventListener('click', showTimerView);
  
  // Save settings event listener
  document.getElementById('save-settings')?.addEventListener('click', () => {
    const workInput = document.getElementById('work-minutes') as HTMLInputElement;
    const breakInput = document.getElementById('break-minutes') as HTMLInputElement;
    
    if (workInput && breakInput) {
      const newSettings: TimerSettings = {
        workMinutes: parseInt(workInput.value),
        breakMinutes: parseInt(breakInput.value)
      };
      
      if (newSettings.workMinutes > 0 && newSettings.breakMinutes > 0) {
        saveSettings(newSettings);
        // タイマーが実行中の場合は停止してリセット
        if (timer && timer.getState() !== 'idle') {
          timer.reset();
        }
        showTimerView();
      }
    }
  });
}

function showTimerView(): void {
  currentView = 'timer';
  initializeTimerApp();
}

function initializeTimerApp(): void {
  const settings = getSettings();
  
  app.innerHTML = `
    <div class="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-white p-4 lg:p-8">
      <div class="absolute top-4 right-4">
        <button id="settings-btn" class="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center" aria-label="設定">
          ${getSettingsIcon()}
        </button>
      </div>
      
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
          <div id="time-display" class="absolute inset-0 flex items-center justify-center text-5xl lg:text-6xl font-mono font-bold text-gray-800">${formatTime(settings.workMinutes * 60)}</div>
        </div>
      </div>
      
      <div class="flex flex-row lg:flex-col justify-center items-center gap-6 lg:gap-8">
        <button id="play-pause-btn" class="p-4 lg:p-6 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center" aria-label="スタート">
          ${getPlayIcon()}
        </button>
        <div class="relative">
          <button id="reset-btn" class="p-4 lg:p-6 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center relative overflow-hidden" disabled aria-label="リセット（長押し）">
            <div class="relative z-10">
              ${getResetIcon()}
            </div>
            <div id="reset-progress" class="absolute inset-0 bg-red-500 opacity-40 w-0 transition-none"></div>
          </button>
        </div>
      </div>
    </div>
  `;

  timer = new PomodoroTimer({
    workMinutes: settings.workMinutes,
    breakMinutes: settings.breakMinutes,
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

  // リセットボタンの長押しイベントリスナー
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('mousedown', startResetHold);
    resetBtn.addEventListener('mouseup', resetResetHold);
    resetBtn.addEventListener('mouseleave', resetResetHold);
    resetBtn.addEventListener('touchstart', startResetHold);
    resetBtn.addEventListener('touchend', resetResetHold);
    resetBtn.addEventListener('touchcancel', resetResetHold);
  }
  
  // Settings button event listener
  document.getElementById('settings-btn')?.addEventListener('click', showSettingsView);

  // 初期状態のプログレスバーを設定
  updateProgressCircle(settings.workMinutes * 60);

  // デバッグ用：sキーで残り1秒までスキップ
  document.addEventListener('keydown', (event) => {
    if (event.key === 's' || event.key === 'S') {
      timer.skipToLastSecond();
    }
  });
}

function initializeApp(): void {
  showTimerView();
}

initializeApp();