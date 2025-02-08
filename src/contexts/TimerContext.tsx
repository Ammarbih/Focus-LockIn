import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useSettings } from './SettingsContext';

interface TimerContextType {
  timeLeft: number;
  isRunning: boolean;
  isPaused: boolean;
  initialTime: number;
  lastSetTime: number;
  toggleTimer: () => void;
  resetTimer: () => void;
  adjustTime: (amount: number) => void;
  updateSettings: (time: number) => void;
  setTimeLeft: (time: number | ((prev: number) => number)) => void;
  setInitialTime: (time: number) => void;
  setIsRunning: (running: boolean) => void;
  setLastSetTime: (time: number) => void;
  setIsPaused: (paused: boolean) => void;
}

const TimerContext = createContext<TimerContextType | null>(null);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { settings } = useSettings();
  const [timeLeft, setTimeLeft] = useState(settings.defaultFocusTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [initialTime, setInitialTime] = useState(settings.defaultFocusTime * 60);
  const [lastSetTime, setLastSetTime] = useState(settings.defaultFocusTime * 60);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  useEffect(() => {
    let requestId: number;

    const updateTimer = (timestamp: number) => {
      if (!lastUpdate) {
        setLastUpdate(timestamp);
        requestId = requestAnimationFrame(updateTimer);
        return;
      }

      const deltaTime = timestamp - lastUpdate;
      if (deltaTime >= 1000) { // Update every second
        setTimeLeft(prev => {
          if (prev <= 0) {
            setIsRunning(false);
            setIsPaused(false);
            setLastUpdate(null);
            return lastSetTime;
          }
          return prev - 1;
        });
        setLastUpdate(timestamp);
      }

      if (isRunning && !isPaused) {
        requestId = requestAnimationFrame(updateTimer);
      }
    };

    if (isRunning && !isPaused) {
      requestId = requestAnimationFrame(updateTimer);
    } else {
      setLastUpdate(null);
    }

    return () => {
      if (requestId) {
        cancelAnimationFrame(requestId);
      }
    };
  }, [isRunning, isPaused, lastSetTime]);

  const toggleTimer = useCallback(() => {
    if (!isRunning) {
      setTimeLeft(lastSetTime);
      setInitialTime(lastSetTime);
      setIsRunning(true);
      setIsPaused(false);
    } else {
      setIsRunning(false);
      setIsPaused(false);
      setTimeLeft(lastSetTime);
      setInitialTime(lastSetTime);
    }
  }, [isRunning, lastSetTime]);

  const resetTimer = useCallback(() => {
    setTimeLeft(lastSetTime);
    setInitialTime(lastSetTime);
    setIsRunning(false);
    setIsPaused(false);
  }, [lastSetTime]);

  const adjustTime = useCallback((amount: number) => {
    if (!isRunning && !isPaused) {
      const newMinutes = Math.max(1, Math.min(120, Math.floor(timeLeft / 60) + amount));
      const newSeconds = newMinutes * 60;
      setTimeLeft(newSeconds);
      setInitialTime(newSeconds);
      setLastSetTime(newSeconds);
    }
  }, [isRunning, isPaused, timeLeft]);

  const updateSettings = useCallback((time: number) => {
    const newSeconds = time * 60;
    setTimeLeft(newSeconds);
    setInitialTime(newSeconds);
    setLastSetTime(newSeconds);
  }, []);

  return (
    <TimerContext.Provider
      value={{
        timeLeft,
        isRunning,
        isPaused,
        initialTime,
        lastSetTime,
        toggleTimer,
        resetTimer,
        adjustTime,
        updateSettings,
        setTimeLeft,
        setInitialTime,
        setIsRunning,
        setLastSetTime,
        setIsPaused
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};