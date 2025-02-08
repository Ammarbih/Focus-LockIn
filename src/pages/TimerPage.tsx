import React, { useState, useEffect, useRef } from 'react';
import './TimerPage.css';

const MOTIVATION_TEXTS = [
  "LOCK IN!", // 100%
  "STAY FOCUSED!", // 90%
  "KEEP PUSHING!", // 80%
  "YOU GOT THIS!", // 70%
  "STAY STRONG!", // 60%
  "HALFWAY THERE!", // 50%
  "KEEP GOING!", // 40%
  "DON'T GIVE UP!", // 30%
  "PUSH THROUGH!", // 20%
  "ALMOST THERE!" // 10%
];

const TimerPage: React.FC = () => {
  const [minutes, setMinutes] = useState(26);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [motivationText, setMotivationText] = useState(MOTIVATION_TEXTS[0]);
  const [progress, setProgress] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  
  const intervalRef = useRef<number>();
  const initialTimeRef = useRef({ minutes: 26, seconds: 0 });

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(prevSeconds => {
          let newSeconds = prevSeconds;
          let newMinutes = minutes;

          if (prevSeconds === 0) {
            if (minutes === 0) {
              setIsRunning(false);
              setIsPaused(false);
              setProgress(100);
              setMotivationText(MOTIVATION_TEXTS[9]);
              return 0;
            }
            newSeconds = 59;
            newMinutes = minutes - 1;
            setMinutes(newMinutes);
          } else {
            newSeconds = prevSeconds - 1;
          }

          // Bereken percentage voor voortgangsbalk
          const currentTotal = (newMinutes * 60) + newSeconds;
          const progressPercentage = Math.round((currentTotal / totalSeconds) * 100);
          setProgress(100 - progressPercentage); // Draai het percentage om

          // Bereken percentage voor motivatie tekst
          const timePercentage = progressPercentage;
          const textIndex = 9 - Math.floor(timePercentage / 10);
          setMotivationText(MOTIVATION_TEXTS[Math.min(textIndex, 9)]);

          return newSeconds;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, minutes, totalSeconds]);

  const startTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
    initialTimeRef.current = { minutes, seconds };
    const total = (minutes * 60) + seconds;
    setTotalSeconds(total);
    setProgress(0);
    setMotivationText(MOTIVATION_TEXTS[0]);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setMinutes(initialTimeRef.current.minutes);
    setSeconds(initialTimeRef.current.seconds);
    setProgress(0);
    setMotivationText(MOTIVATION_TEXTS[0]);
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setIsPaused(false);
  };

  const adjustDigit = (type: 'minutes' | 'seconds', position: 'tens' | 'ones', increment: boolean) => {
    if (isRunning) return;
    
    if (type === 'minutes') {
      setMinutes(prev => {
        const tens = Math.floor(prev / 10);
        const ones = prev % 10;
        
        if (position === 'tens') {
          const newTens = increment ? (tens + 1) % 10 : (tens - 1 + 10) % 10;
          return newTens * 10 + ones;
        } else {
          const newOnes = increment ? (ones + 1) % 10 : (ones - 1 + 10) % 10;
          return tens * 10 + newOnes;
        }
      });
    } else {
      setSeconds(prev => {
        const tens = Math.floor(prev / 10);
        const ones = prev % 10;
        
        if (position === 'tens') {
          const newTens = increment ? (tens + 1) % 6 : (tens - 1 + 6) % 6;
          return newTens * 10 + ones;
        } else {
          const newOnes = increment ? (ones + 1) % 10 : (ones - 1 + 10) % 10;
          return tens * 10 + newOnes;
        }
      });
    }
  };

  const formatNumber = (num: number): string[] => {
    return num.toString().padStart(2, '0').split('');
  };

  const renderDigit = (type: 'minutes' | 'seconds', digit: string, position: 'tens' | 'ones') => (
    <div className="digit-group">
      {!isRunning && (
        <button className="arrow up" onClick={() => adjustDigit(type, position, true)}>▲</button>
      )}
      <div className="digit">{digit}</div>
      {!isRunning && (
        <button className="arrow down" onClick={() => adjustDigit(type, position, false)}>▼</button>
      )}
    </div>
  );

  const minuteDigits = formatNumber(minutes);
  const secondDigits = formatNumber(seconds);

  const size = 380;
  const strokeWidth = 6;
  const radius = (size / 2) - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = (progress / 100) * circumference;

  return (
    <div className="timer-container">
      <div className="motivation-text">{motivationText}</div>
      <div className="timer-circle">
        <svg className="progress-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            className="progress-ring-circle-bg"
            stroke="#00FF73"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size/2}
            cy={size/2}
            transform="rotate(-90 190 190)"
          />
          <circle
            className="progress-ring-circle"
            stroke="#00FF73"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size/2}
            cy={size/2}
            transform="rotate(-90 190 190)"
            style={{
              strokeDasharray: `${circumference} ${circumference}`,
              strokeDashoffset: offset
            }}
          />
        </svg>
        <div className="timer-display">
          <div className="time-group">
            {renderDigit('minutes', minuteDigits[0], 'tens')}
            {renderDigit('minutes', minuteDigits[1], 'ones')}
          </div>
          <div className="separator">:</div>
          <div className="time-group">
            {renderDigit('seconds', secondDigits[0], 'tens')}
            {renderDigit('seconds', secondDigits[1], 'ones')}
          </div>
        </div>
      </div>
      <div className="controls">
        {!isRunning ? (
          <button className="control-button" onClick={startTimer}>START</button>
        ) : (
          <>
            <button className="control-button" onClick={stopTimer}>STOP</button>
            <button className="control-button pause" onClick={isPaused ? resumeTimer : pauseTimer}>
              {isPaused ? 'RESUME' : 'PAUSE'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TimerPage;