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
  const [isCompleted, setIsCompleted] = useState(false);
  const [motivationText, setMotivationText] = useState(MOTIVATION_TEXTS[0]);
  const [progress, setProgress] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);
  
  const intervalRef = useRef<number>();
  const initialTimeRef = useRef({ minutes: 26, seconds: 0 });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on component mount
  useEffect(() => {
    const audio = new Audio(process.env.PUBLIC_URL + '/Sounds/Alarm.MP3');
    audio.loop = true;
    
    // Load the audio file
    audio.load();
    
    // Set up event listeners
    audio.addEventListener('canplaythrough', () => {
      setAudioLoaded(true);
      console.log('Audio loaded and ready to play');
    });

    audio.addEventListener('error', (e) => {
      console.error('Error loading audio:', e);
    });

    audioRef.current = audio;

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Handle audio playback
  const startAlarm = async () => {
    if (audioRef.current && audioLoaded) {
      try {
        audioRef.current.currentTime = 0;
        // Use await to catch any autoplay restrictions
        await audioRef.current.play();
      } catch (error) {
        console.error('Error playing alarm:', error);
        // If autoplay is blocked, try to play on next user interaction
        const playOnInteraction = async () => {
          try {
            await audioRef.current?.play();
            document.removeEventListener('touchstart', playOnInteraction);
            document.removeEventListener('click', playOnInteraction);
          } catch (e) {
            console.error('Still cannot play audio:', e);
          }
        };
        document.addEventListener('touchstart', playOnInteraction);
        document.addEventListener('click', playOnInteraction);
      }
    }
  };

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // Start preloading audio when user first interacts with the page
  const handleFirstInteraction = () => {
    if (audioRef.current && !audioLoaded) {
      audioRef.current.load();
    }
  };

  useEffect(() => {
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    document.addEventListener('click', handleFirstInteraction, { once: true });
    return () => {
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('click', handleFirstInteraction);
    };
  }, []);

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
              setMotivationText("TIME'S UP!");
              setProgress(100);
              setIsCompleted(true);
              startAlarm(); // Start the alarm when timer completes
              return 0;
            }
            newSeconds = 59;
            newMinutes = minutes - 1;
            setMinutes(newMinutes);
          } else {
            newSeconds = prevSeconds - 1;
          }

          const currentTotalSeconds = (newMinutes * 60) + newSeconds;
          const initialTotalSeconds = (initialTimeRef.current.minutes * 60) + initialTimeRef.current.seconds;
          const percentageRemaining = (currentTotalSeconds / initialTotalSeconds) * 100;
          setProgress(100 - percentageRemaining);
          const textIndex = Math.floor((100 - percentageRemaining) / 10);
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
  }, [isRunning, isPaused, minutes]);

  const startTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
    setIsCompleted(false);
    initialTimeRef.current = { minutes, seconds };
    setProgress(0);
    setMotivationText(MOTIVATION_TEXTS[0]);
  };

  const stopTimer = () => {
    stopAlarm(); // Stop alarm if it's playing
    setIsRunning(false);
    setIsPaused(false);
    setIsCompleted(false);
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

  const handleDone = () => {
    stopAlarm(); // Stop the alarm when Done is clicked
    setIsCompleted(false);
    setMinutes(initialTimeRef.current.minutes);
    setSeconds(initialTimeRef.current.seconds);
    setProgress(0);
    setMotivationText(MOTIVATION_TEXTS[0]);
  };

  const adjustDigit = (type: 'minutes' | 'seconds', position: 'tens' | 'ones', increment: boolean) => {
    if (isRunning) return;

    const setValue = type === 'minutes' ? setMinutes : setSeconds;
    const currentValue = type === 'minutes' ? minutes : seconds;
    const max = type === 'minutes' ? 99 : 59;

    let newValue = currentValue;
    const incrementValue = position === 'tens' ? 10 : 1;

    if (increment) {
      newValue += incrementValue;
      if (newValue > max) newValue = 0;
    } else {
      newValue -= incrementValue;
      if (newValue < 0) newValue = max;
    }

    setValue(newValue);
  };

  return (
    <div className={`timer-container ${isRunning ? 'running' : ''}`}>
      <div className="motivation-text">{motivationText}</div>
      <div className={`timer-circle ${isCompleted ? 'shake' : ''} ${isRunning ? 'running' : ''}`}>
        <svg className="progress-ring" viewBox="0 0 100 100">
          <circle
            className="progress-ring-circle-bg"
            cx="50"
            cy="50"
            r="47"
            strokeWidth="3"
          />
          <circle
            className="progress-ring-circle"
            cx="50"
            cy="50"
            r="47"
            strokeWidth="3"
            style={{
              strokeDasharray: `${2 * Math.PI * 47}`,
              strokeDashoffset: `${2 * Math.PI * 47 * (1 - progress / 100)}`
            }}
          />
        </svg>
        <div className="timer-display">
          <div className="time-group">
            <div className="digit-group">
              <button
                className="digit-button top"
                onClick={() => adjustDigit('minutes', 'tens', true)}
                disabled={isRunning}
              >
                ▲
              </button>
              <div className="digit">{Math.floor(minutes / 10)}</div>
              <button
                className="digit-button bottom"
                onClick={() => adjustDigit('minutes', 'tens', false)}
                disabled={isRunning}
              >
                ▼
              </button>
            </div>
            <div className="digit-group">
              <button
                className="digit-button top"
                onClick={() => adjustDigit('minutes', 'ones', true)}
                disabled={isRunning}
              >
                ▲
              </button>
              <div className="digit">{minutes % 10}</div>
              <button
                className="digit-button bottom"
                onClick={() => adjustDigit('minutes', 'ones', false)}
                disabled={isRunning}
              >
                ▼
              </button>
            </div>
          </div>
          <div className="separator">:</div>
          <div className="time-group">
            <div className="digit-group">
              <button
                className="digit-button top"
                onClick={() => adjustDigit('seconds', 'tens', true)}
                disabled={isRunning}
              >
                ▲
              </button>
              <div className="digit">{Math.floor(seconds / 10)}</div>
              <button
                className="digit-button bottom"
                onClick={() => adjustDigit('seconds', 'tens', false)}
                disabled={isRunning}
              >
                ▼
              </button>
            </div>
            <div className="digit-group">
              <button
                className="digit-button top"
                onClick={() => adjustDigit('seconds', 'ones', true)}
                disabled={isRunning}
              >
                ▲
              </button>
              <div className="digit">{seconds % 10}</div>
              <button
                className="digit-button bottom"
                onClick={() => adjustDigit('seconds', 'ones', false)}
                disabled={isRunning}
              >
                ▼
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="controls">
        {isCompleted ? (
          <button className="control-button done" onClick={handleDone}>
            Done
          </button>
        ) : !isRunning ? (
          <button className="control-button start" onClick={startTimer}>
            Start
          </button>
        ) : (
          <>
            <button className="control-button stop" onClick={stopTimer}>
              Stop
            </button>
            {!isPaused ? (
              <button className="control-button pause" onClick={pauseTimer}>
                Pause
              </button>
            ) : (
              <button className="control-button resume" onClick={resumeTimer}>
                Resume
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TimerPage;