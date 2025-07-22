export type TimerState = 'idle' | 'work' | 'break' | 'paused';

export interface TimerConfig {
  workMinutes: number;
  breakMinutes: number;
  onTick?: (timeLeft: number) => void;
  onStateChange?: (state: TimerState) => void;
  onComplete?: () => void;
}

export class PomodoroTimer {
  private config: TimerConfig;
  private state: TimerState = 'idle';
  private timeLeft: number = 0;
  private intervalId?: number;

  constructor(config: TimerConfig) {
    this.config = {
      workMinutes: 25,
      breakMinutes: 5,
      ...config
    };
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
    if (this.state === 'work' || this.state === 'break') {
      this.state = 'paused';
      this.stopTimer();
      this.config.onStateChange?.(this.state);
    }
  }

  reset(): void {
    this.stopTimer();
    this.state = 'idle';
    this.timeLeft = this.config.workMinutes * 60;
    this.config.onStateChange?.(this.state);
    this.config.onTick?.(this.timeLeft);
  }

  private startTimer(): void {
    this.intervalId = setInterval(() => {
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
      this.state = 'break';
      this.timeLeft = this.config.breakMinutes * 60;
      this.startTimer();
    } else if (this.state === 'break') {
      this.state = 'idle';
      this.timeLeft = 0;
    }

    this.config.onStateChange?.(this.state);
  }

  private getPreviousState(): TimerState {
    return this.timeLeft > this.config.breakMinutes * 60 ? 'work' : 'break';
  }

  getState(): TimerState {
    return this.state;
  }

  getTimeLeft(): number {
    return this.timeLeft;
  }
}