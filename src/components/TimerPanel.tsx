import { useStore } from '../store';
import { useState } from 'react';
import { Icons } from './Icons';

export function TimerPanel() {
  const { timer, setTimerState, pomodoroConfig } = useStore();
  const [selectedMinutes, setSelectedMinutes] = useState(30);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startPomodoro = () => {
    setTimerState({
      type: 'pomodoro',
      remainingSeconds: pomodoroConfig.focusMinutes * 60,
      isActive: true,
      pomodoroPhase: 'focus',
    });
  };

  const startSleepTimer = () => {
    setTimerState({
      type: 'sleep',
      remainingSeconds: selectedMinutes * 60,
      isActive: true,
    });
  };

  const stopTimer = () => {
    setTimerState({
      type: 'off',
      remainingSeconds: 0,
      isActive: false,
    });
  };

  const progress = timer.type !== 'off'
    ? ((timer.type === 'pomodoro' ? pomodoroConfig.focusMinutes * 60 : selectedMinutes * 60) - timer.remainingSeconds) /
      (timer.type === 'pomodoro' ? pomodoroConfig.focusMinutes * 60 : selectedMinutes * 60) * 100
    : 0;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Icons.Timer className="text-primary" />
          Timer
        </h2>
      </div>

      {timer.type === 'off' && (
        <div className="space-y-4">
          <button
            onClick={startPomodoro}
            className="w-full py-4 bg-gradient-to-r from-primary to-indigo-500 hover:scale-[1.02] rounded-2xl font-bold transition-all shadow-lg hover:shadow-primary/25 text-white btn-glow flex items-center justify-center gap-2.5"
          >
            <Icons.Pomodoro size={20} />
            Focus Session ({pomodoroConfig.focusMinutes}m)
          </button>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
              <Icons.Sleep size={14} />
              Sleep Timer
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setSelectedMinutes(mins)}
                  className={`py-3 rounded-xl font-medium transition-all-smooth ${
                    selectedMinutes === mins
                      ? 'bg-gradient-to-br from-secondary to-violet-500 text-white shadow-lg scale-105'
                      : 'glass hover:bg-secondary/20'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
            <button
              onClick={startSleepTimer}
              className="w-full py-4 bg-gradient-to-r from-secondary to-violet-500 hover:from-violet-500 hover:to-secondary rounded-2xl font-semibold transition-all-smooth shadow-lg hover:shadow-2xl text-white btn-glow"
            >
              Start Sleep Timer ({selectedMinutes}m)
            </button>
          </div>
        </div>
      )}

      {timer.type !== 'off' && (
        <div className="text-center space-y-6">
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-slate-200 dark:text-slate-800 opacity-50"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="50%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-mono font-bold" style={{ fontFamily: 'Space Mono, monospace' }}>
                {formatTime(timer.remainingSeconds)}
              </div>
              <p className="text-sm text-text-muted mt-2 font-medium capitalize">
                {timer.type === 'pomodoro' ? timer.pomodoroPhase.replace(/([A-Z])/g, ' $1').trim() : 'Sleep Mode'}
              </p>
            </div>
          </div>

          <button
            onClick={stopTimer}
            className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-500 rounded-2xl font-semibold transition-all-smooth shadow-lg hover:shadow-2xl text-white btn-glow flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Stop Timer
          </button>
        </div>
      )}
    </div>
  );
}
