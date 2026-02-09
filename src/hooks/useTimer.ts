import { useEffect, useCallback, useRef } from 'react';
import { useStore } from '../store';

export function useTimer() {
  const { timer, audio: { setIsPlaying }, setTimerState } = useStore();
  const intervalRef = useRef<number | null>(null);
  const fadeTimeoutRef = useRef<number | null>(null);

  const playNotification = useCallback(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, []);

  const fadeOutAudio = useCallback(async () => {
    const { MixerController } = await import('../audio/MixerController');
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const mixer = new MixerController(audioContext);

    const duration = 180;
    const fadeInterval = 100;
    const steps = (duration * 1000) / fadeInterval;
    const volumeStep = 1 / steps;

    let currentVolume = mixer.getMasterVolume();

    fadeTimeoutRef.current = window.setInterval(() => {
      currentVolume -= volumeStep;
      if (currentVolume <= 0) {
        currentVolume = 0;
        mixer.stopAll();
        setIsPlaying(false);
        setTimerState({
          type: 'off',
          remainingSeconds: 0,
          isActive: false,
        });
        if (fadeTimeoutRef.current) {
          clearInterval(fadeTimeoutRef.current);
          fadeTimeoutRef.current = null;
        }
      }
      mixer.setMasterVolume(currentVolume);
    }, fadeInterval);
  }, [setIsPlaying, setTimerState]);

  const startTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      const currentState = useStore.getState().timer;

      if (currentState.remainingSeconds <= 1) {
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        if (currentState.type === 'sleep') {
          fadeOutAudio();
          setTimerState({ remainingSeconds: 0, isActive: false });
          return;
        }

        if (currentState.type === 'pomodoro') {
          playNotification();

          if (currentState.pomodoroPhase === 'focus') {
            const newSession = currentState.pomodoroSession + 1;
            const { pomodoroConfig } = useStore.getState();
            const breakMins = (newSession % pomodoroConfig.sessionsBeforeLongBreak === 0)
              ? pomodoroConfig.longBreakMinutes
              : pomodoroConfig.shortBreakMinutes;

            setTimerState({
              pomodoroPhase: (newSession % pomodoroConfig.sessionsBeforeLongBreak === 0)
                ? 'longBreak'
                : 'shortBreak',
              pomodoroSession: newSession,
              remainingSeconds: breakMins * 60,
            });
          } else {
            setTimerState({
              pomodoroPhase: 'focus',
              remainingSeconds: useStore.getState().pomodoroConfig.focusMinutes * 60,
            });
          }
          return;
        }
      }

      setTimerState({ remainingSeconds: currentState.remainingSeconds - 1 });
    }, 1000);
  }, [setTimerState, playNotification, fadeOutAudio]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (fadeTimeoutRef.current !== null) {
      clearInterval(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (timer.isActive) {
      startTimer();
    } else {
      stopTimer();
    }

    return () => {
      stopTimer();
    };
  }, [timer.isActive, startTimer, stopTimer]);

  return { timer };
}
