export type TimerState = 'idle' | 'work' | 'break' | 'longBreak' | 'paused';

export interface TimerConfig {
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  cyclesUntilLongBreak: number;
  longBreakEnabled: boolean;
  onTick?: (timeLeft: number) => void;
  onStateChange?: (state: TimerState) => void;
  onComplete?: () => void;
}

export class PomodoroTimer {
  private config: TimerConfig;
  private state: TimerState = 'idle';
  private timeLeft: number = 0;
  private intervalId?: number;
  private completedCycles: number = 0;

  constructor(config: TimerConfig) {
    this.config = config;
  }

  start(): void {
    if (this.state === 'idle') {
      this.state = 'work';
      this.timeLeft = this.config.workMinutes * 60;
      this.startTimer();
    } else if (this.state === 'paused') {
      this.state = this.getPreviousState();
      this.startTimer();
    }
    this.config.onStateChange?.(this.state);
  }

  pause(): void {
    if (this.state === 'work' || this.state === 'break' || this.state === 'longBreak') {
      this.state = 'paused';
      this.stopTimer();
      this.config.onStateChange?.(this.state);
    }
  }

  reset(): void {
    this.stopTimer();
    this.state = 'idle';
    this.timeLeft = this.config.workMinutes * 60;
    this.completedCycles = 0;
    this.config.onStateChange?.(this.state);
    this.config.onTick?.(this.timeLeft);
  }

  private startTimer(): void {
    this.intervalId = window.setInterval(() => {
      this.timeLeft--;
      this.config.onTick?.(this.timeLeft);

      if (this.timeLeft <= 0) {
        this.handleTimerComplete();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private handleTimerComplete(): void {
    this.stopTimer();
    this.config.onComplete?.();

    if (this.state === 'work') {
      this.completedCycles++;
      
      // 長い休憩が有効で設定されたサイクル数に達した場合は長い休憩
      if (this.config.longBreakEnabled && this.completedCycles >= this.config.cyclesUntilLongBreak) {
        this.state = 'longBreak';
        this.timeLeft = this.config.longBreakMinutes * 60;
        this.completedCycles = 0; // カウンターリセット
      } else {
        this.state = 'break';
        this.timeLeft = this.config.breakMinutes * 60;
      }
      this.startTimer();
    } else if (this.state === 'break' || this.state === 'longBreak') {
      this.state = 'work';
      this.timeLeft = this.config.workMinutes * 60;
      this.startTimer();
    }

    this.config.onStateChange?.(this.state);
  }

  private getPreviousState(): TimerState {
    if (this.timeLeft > this.config.longBreakMinutes * 60) {
      return 'work';
    } else if (this.timeLeft > this.config.breakMinutes * 60) {
      return 'longBreak';
    } else {
      return 'break';
    }
  }

  getState(): TimerState {
    return this.state;
  }

  getTimeLeft(): number {
    return this.timeLeft;
  }

  // デバッグ用：残り1秒までスキップ
  skipToLastSecond(): void {
    if (this.state === 'work' || this.state === 'break' || this.state === 'longBreak') {
      this.timeLeft = 1;
      this.config.onTick?.(this.timeLeft);
    }
  }
}