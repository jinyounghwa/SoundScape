import { useStore } from '../store';
import { useState } from 'react';

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

  return (
    <div className="bg-card rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">Timer</h2>

      {timer.type === 'off' && (
        <div className="space-y-3">
          <button
            onClick={startPomodoro}
            className="w-full py-3 bg-primary hover:bg-indigo-600 rounded-lg font-medium transition-colors"
          >
            Pomodoro ({pomodoroConfig.focusMinutes}m)
          </button>

          <div className="space-y-2">
            <label className="text-sm text-text-muted">Sleep Timer</label>
            <div className="flex gap-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setSelectedMinutes(mins)}
                  className={`flex-1 py-2 rounded-lg transition-colors ${
                    selectedMinutes === mins
                      ? 'bg-primary text-white'
                      : 'bg-background hover:bg-primary/20'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
            <button
              onClick={startSleepTimer}
              className="w-full py-3 bg-secondary hover:bg-violet-600 rounded-lg font-medium transition-colors"
            >
              Start Sleep Timer ({selectedMinutes}m)
            </button>
          </div>
        </div>
      )}

      {timer.type !== 'off' && (
        <div className="text-center">
          <div className="text-4xl font-mono font-bold mb-4">
            {formatTime(timer.remainingSeconds)}
          </div>
          <p className="text-text-muted mb-4">
            {timer.type === 'pomodoro' ? timer.pomodoroPhase : 'Sleep'}
          </p>
          <button
            onClick={stopTimer}
            className="w-full py-3 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors"
          >
            Stop Timer
          </button>
        </div>
      )}
    </div>
  );
}
