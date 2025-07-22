export type TimerState = 'idle' | 'work' | 'break' | 'longBreak' | 'paused' | 'waiting';

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
  private previousState: TimerState = 'idle';

  constructor(config: TimerConfig) {
    this.config = config;
  }

  start(): void {
    if (this.state === 'idle') {
      this.previousState = 'idle';
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
      this.previousState = this.state;
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
    this.previousState = 'idle';
    this.config.onStateChange?.(this.state);
    this.config.onTick?.(this.timeLeft);
  }

  private startTimer(): void {
    this.previousState = this.state;
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
    this.state = 'waiting'; // 待機状態に設定
    this.config.onComplete?.();
    this.config.onStateChange?.(this.state);
  }

  // 次の状態に進む（タップされた時に呼ばれる）
  proceedToNext(): void {
    if (this.state !== 'waiting') return;

    if (this.timeLeft <= 0) {
      // 前の状態に基づいて次の状態を決定
      const previousState = this.getPreviousStateFromTime();
      
      if (previousState === 'work') {
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
      } else if (previousState === 'break' || previousState === 'longBreak') {
        this.state = 'work';
        this.timeLeft = this.config.workMinutes * 60;
      }

      this.startTimer();
      this.config.onStateChange?.(this.state);
    }
  }

  private getPreviousStateFromTime(): TimerState {
    return this.previousState;
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

  // デバッグ用：即座にタイマー完了
  skipToLastSecond(): void {
    if (this.state === 'work' || this.state === 'break' || this.state === 'longBreak') {
      this.timeLeft = 0;
      this.config.onTick?.(this.timeLeft);
      // 次のイベントループで完了処理を実行
      setTimeout(() => {
        if (this.timeLeft === 0) {
          this.handleTimerComplete();
        }
      }, 100);
    }
  }
}