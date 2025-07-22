import './style.css'
import { PomodoroTimer } from './timer'

const app = document.querySelector<HTMLDivElement>('#app')!

let timer: PomodoroTimer;
let flashInterval: number | undefined;

interface TimerSettings {
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  cyclesUntilLongBreak: number;
  longBreakEnabled: boolean;
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
  return { 
    workMinutes: 25, 
    breakMinutes: 5, 
    longBreakMinutes: 15, 
    cyclesUntilLongBreak: 4,
    longBreakEnabled: true
  };
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
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>`;
}

function getPauseIcon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
  </svg>`;
}

function getResetIcon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
  </svg>`;
}

function getSettingsIcon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
  </svg>`;
}

function getBackIcon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
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
  
  // 固定半径（viewBoxベースなので常に140）
  const circumference = 2 * Math.PI * 140;
  const offset = circumference * (1 - percentage);
  
  progressCircle.style.strokeDashoffset = offset.toString();
}

function updateButtons(state: string): void {
  console.log('updateButtons called with state:', state);
  const playPauseBtn = document.getElementById('play-pause-btn') as HTMLButtonElement;
  const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
  const settingsContainer = document.getElementById('settings-container') as HTMLDivElement;

  if (state === 'idle') {
    playPauseBtn.innerHTML = getPlayIcon();
    playPauseBtn.setAttribute('aria-label', 'スタート');
    playPauseBtn.className = 'p-5 md:p-7 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors w-20 h-20 md:w-24 md:h-24 flex items-center justify-center';
    playPauseBtn.disabled = false;
    resetBtn.disabled = true;
    resetBtn.className = 'p-5 md:p-7 bg-gray-400 text-gray-300 rounded-full cursor-not-allowed w-20 h-20 md:w-24 md:h-24 flex items-center justify-center';
    // アイドル状態でのみ設定ボタンを表示
    if (settingsContainer) settingsContainer.style.display = 'block';
  } else if (state === 'work' || state === 'break' || state === 'longBreak') {
    playPauseBtn.innerHTML = getPauseIcon();
    playPauseBtn.setAttribute('aria-label', '一時停止');
    playPauseBtn.className = 'p-5 md:p-7 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors w-20 h-20 md:w-24 md:h-24 flex items-center justify-center';
    playPauseBtn.disabled = false;
    resetBtn.disabled = false;
    resetBtn.className = 'p-5 md:p-7 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors w-20 h-20 md:w-24 md:h-24 flex items-center justify-center';
    // タイマー実行中は設定ボタンを非表示
    if (settingsContainer) settingsContainer.style.display = 'none';
  } else if (state === 'paused') {
    playPauseBtn.innerHTML = getPlayIcon();
    playPauseBtn.setAttribute('aria-label', '再開');
    playPauseBtn.className = 'p-5 md:p-7 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors w-20 h-20 md:w-24 md:h-24 flex items-center justify-center';
    playPauseBtn.disabled = false;
    resetBtn.disabled = false;
    resetBtn.className = 'p-5 md:p-7 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors w-20 h-20 md:w-24 md:h-24 flex items-center justify-center';
    // 一時停止中は設定ボタンを非表示
    if (settingsContainer) settingsContainer.style.display = 'none';
  } else if (state === 'waiting') {
    playPauseBtn.innerHTML = getPlayIcon();
    playPauseBtn.setAttribute('aria-label', '次へ');
    playPauseBtn.className = 'p-5 md:p-7 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors w-20 h-20 md:w-24 md:h-24 flex items-center justify-center animate-pulse';
    playPauseBtn.disabled = false;
    resetBtn.disabled = false;
    resetBtn.className = 'p-5 md:p-7 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors w-20 h-20 md:w-24 md:h-24 flex items-center justify-center';
    // 待機中は設定ボタンを非表示
    if (settingsContainer) settingsContainer.style.display = 'none';
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
      case 'longBreak':
        progressCircle.setAttribute('stroke', '#8b5cf6');
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
  
  // 全画面のオーバーレイを作成
  const overlay = document.createElement('div');
  overlay.id = 'flash-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 215, 0, 0.8);
    z-index: 9999;
    cursor: pointer;
    opacity: 0;
  `;
  
  // オーバーレイをクリックで次の状態に進む
  overlay.addEventListener('click', () => {
    stopFlashing();
    if (timer.getState() === 'waiting') {
      timer.proceedToNext();
    }
  });
  
  document.body.appendChild(overlay);
  
  flashInterval = window.setInterval(() => {
    if (overlay.style.opacity === '0') {
      overlay.style.opacity = '1';
    } else {
      overlay.style.opacity = '0';
    }
  }, 400);
}

function stopFlashing(): void {
  if (flashInterval) {
    clearInterval(flashInterval);
    flashInterval = undefined;
    const overlay = document.getElementById('flash-overlay');
    if (overlay) {
      document.body.removeChild(overlay);
    }
  }
}

function showResetDialog(): void {
  const dialog = document.createElement('div');
  dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  dialog.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
      <h3 class="text-lg font-semibold text-gray-800 mb-4 text-center">タイマーをリセットしますか？</h3>
      <p class="text-gray-600 text-sm mb-6 text-center">現在の進行状況が失われます</p>
      <div class="flex gap-3">
        <button id="cancel-reset" class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium">
          キャンセル
        </button>
        <button id="confirm-reset" class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">
          リセット
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(dialog);
  
  // キャンセルボタン
  document.getElementById('cancel-reset')?.addEventListener('click', () => {
    document.body.removeChild(dialog);
  });
  
  // 確認ボタン
  document.getElementById('confirm-reset')?.addEventListener('click', () => {
    stopFlashing(); // リセット時に点滅を確実に停止
    timer.reset();
    document.body.removeChild(dialog);
  });
  
  // 背景クリックでキャンセル
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      document.body.removeChild(dialog);
    }
  });
  
  // ESCキーでキャンセル
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      document.body.removeChild(dialog);
      document.removeEventListener('keydown', handleKeydown);
    }
  };
  document.addEventListener('keydown', handleKeydown);
}

function showSettingsView(): void {
  const settings = getSettings();
  
  app.innerHTML = `
    <div class="min-h-screen flex flex-col bg-white p-6 lg:p-8">
      <div class="flex items-center justify-between mb-8">
        <button id="back-btn" class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center w-10 h-10" aria-label="戻る">
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
        
        <div class="bg-gray-50 rounded-lg p-6">
          <div class="flex items-center mb-4">
            <input 
              type="checkbox" 
              id="long-break-enabled" 
              ${settings.longBreakEnabled ? 'checked' : ''}
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            >
            <label for="long-break-enabled" class="ml-2 text-sm font-medium text-gray-700">長い休憩を有効にする</label>
          </div>
        </div>
        
        <div id="long-break-settings" class="${settings.longBreakEnabled ? '' : 'hidden'}">
          <div class="bg-gray-50 rounded-lg p-6">
            <label class="block text-sm font-medium text-gray-700 mb-3">長い休憩時間（分）</label>
          <input 
            type="number" 
            id="long-break-minutes" 
            value="${settings.longBreakMinutes}" 
            min="5" 
            max="60" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg"
          >
          </div>
          
          <div class="bg-gray-50 rounded-lg p-6">
            <label class="block text-sm font-medium text-gray-700 mb-3">長い休憩まで（サイクル数）</label>
            <input 
              type="number" 
              id="cycles-until-long-break" 
              value="${settings.cyclesUntilLongBreak}" 
              min="2" 
              max="10" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg"
            >
          </div>
        </div>
        
        <button id="save-settings" class="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-medium">
          設定を保存
        </button>
      </div>
    </div>
  `;

  // Back button event listener
  document.getElementById('back-btn')?.addEventListener('click', showTimerView);
  
  // Long break checkbox event listener
  document.getElementById('long-break-enabled')?.addEventListener('change', (event) => {
    const checkbox = event.target as HTMLInputElement;
    const longBreakSettings = document.getElementById('long-break-settings');
    if (longBreakSettings) {
      if (checkbox.checked) {
        longBreakSettings.classList.remove('hidden');
      } else {
        longBreakSettings.classList.add('hidden');
      }
    }
  });
  
  // Save settings event listener
  document.getElementById('save-settings')?.addEventListener('click', () => {
    const workInput = document.getElementById('work-minutes') as HTMLInputElement;
    const breakInput = document.getElementById('break-minutes') as HTMLInputElement;
    const longBreakInput = document.getElementById('long-break-minutes') as HTMLInputElement;
    const cyclesInput = document.getElementById('cycles-until-long-break') as HTMLInputElement;
    const longBreakEnabledInput = document.getElementById('long-break-enabled') as HTMLInputElement;
    
    if (workInput && breakInput && longBreakInput && cyclesInput && longBreakEnabledInput) {
      const newSettings: TimerSettings = {
        workMinutes: parseInt(workInput.value),
        breakMinutes: parseInt(breakInput.value),
        longBreakMinutes: parseInt(longBreakInput.value),
        cyclesUntilLongBreak: parseInt(cyclesInput.value),
        longBreakEnabled: longBreakEnabledInput.checked
      };
      
      if (newSettings.workMinutes > 0 && newSettings.breakMinutes > 0 && 
          newSettings.longBreakMinutes > 0 && newSettings.cyclesUntilLongBreak > 0) {
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
  initializeTimerApp();
}

function initializeTimerApp(): void {
  const settings = getSettings();
  
  app.innerHTML = `
    <div class="h-screen flex flex-col md:flex-row items-center justify-center bg-white p-2 md:p-4">
      <div id="settings-container" class="absolute top-4 right-4">
        <button id="settings-btn" class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center w-10 h-10" aria-label="設定">
          ${getSettingsIcon()}
        </button>
      </div>
      
      <div class="text-center mb-4 md:mb-0 md:mr-8 relative">
        <div class="relative w-80 h-80 md:w-96 md:h-96 mx-auto">
          <svg class="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 320 320">
            <circle
              cx="160"
              cy="160"
              r="140"
              fill="none"
              stroke="#e5e7eb"
              stroke-width="16"
            />
            <circle
              id="progress-circle"
              cx="160"
              cy="160"
              r="140"
              fill="none"
              stroke="#3b82f6"
              stroke-width="16"
              stroke-dasharray="${2 * Math.PI * 140}"
              stroke-dashoffset="0"
              stroke-linecap="round"
              class="transition-all duration-1000"
            />
          </svg>
          <div id="time-display" class="absolute inset-0 flex items-center justify-center text-4xl md:text-6xl font-mono font-bold text-gray-800 leading-none">${formatTime(settings.workMinutes * 60)}</div>
        </div>
      </div>
      
      <div class="flex flex-row md:flex-col justify-center items-center gap-4 md:gap-6">
        <button id="play-pause-btn" class="p-5 md:p-7 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors w-20 h-20 md:w-24 md:h-24 flex items-center justify-center" aria-label="スタート">
          ${getPlayIcon()}
        </button>
        <button id="reset-btn" class="p-5 md:p-7 bg-gray-400 text-gray-300 rounded-full cursor-not-allowed w-20 h-20 md:w-24 md:h-24 flex items-center justify-center" disabled aria-label="リセット">
          ${getResetIcon()}
        </button>
      </div>
    </div>
  `;

  timer = new PomodoroTimer({
    workMinutes: settings.workMinutes,
    breakMinutes: settings.breakMinutes,
    longBreakMinutes: settings.longBreakMinutes,
    cyclesUntilLongBreak: settings.cyclesUntilLongBreak,
    longBreakEnabled: settings.longBreakEnabled,
    onTick: updateDisplay,
    onStateChange: (state) => {
      console.log('State changed to:', state);
      updateButtons(state);
      updateStateDisplay(state);
    },
    onComplete: () => {
      console.log('Timer completed, starting flash');
      flashScreen();
    }
  });

  // デバッグ用にグローバルに公開
  (window as any).timer = timer;

  // Play/Pause ボタンのイベントリスナー
  document.getElementById('play-pause-btn')?.addEventListener('click', () => {
    const state = timer.getState();
    if (state === 'idle' || state === 'paused') {
      timer.start();
    } else if (state === 'work' || state === 'break' || state === 'longBreak') {
      timer.pause();
    } else if (state === 'waiting') {
      stopFlashing();
      timer.proceedToNext();
    }
  });

  // リセットボタンのクリックイベントリスナー
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    const state = timer.getState();
    if (state !== 'idle') {
      if (state === 'waiting') {
        stopFlashing(); // 点滅を停止してからダイアログ表示
      }
      showResetDialog();
    }
  });
  
  // Settings button event listener
  document.getElementById('settings-btn')?.addEventListener('click', showSettingsView);

  // 初期状態のプログレスバーを設定
  updateProgressCircle(settings.workMinutes * 60);

  // デバッグ用：sキーで残り1秒までスキップ
  document.addEventListener('keydown', (event) => {
    if ((event.key === 's' || event.key === 'S') && timer.getState() !== 'idle' && timer.getState() !== 'waiting') {
      timer.skipToLastSecond();
    }
  });
}

function initializeApp(): void {
  showTimerView();
}

initializeApp();