import React, { useState, useEffect } from 'react';
import './Timer.css';

interface TimerProps {
  initialMinutes: number;
  onComplete: () => void;
}

const Timer: React.FC<TimerProps> = ({ initialMinutes, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsRunning(false);
            onComplete();
            return initialMinutes * 60;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, initialMinutes, onComplete]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="timer">
      <div className="timer-display">{formatTime(timeLeft)}</div>
      <button 
        className={`timer-button ${isRunning ? 'running' : ''}`}
        onClick={toggleTimer}
      >
        {isRunning ? 'Pause' : 'Start'}
      </button>
    </div>
  );
};

export default Timer;