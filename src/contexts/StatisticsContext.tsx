import React, { createContext, useContext, useState, useEffect } from 'react';

interface DailyStats {
  sessions: number;
  minutes: number;
  completed: number;
}

interface Statistics {
  totalSessions: number;
  totalMinutes: number;
  completedSessions: number;
  averageSessionMinutes: number;
  lastUpdated: string;
  dailyStats: { [key: string]: DailyStats };
}

interface StatisticsContextType {
  statistics: Statistics;
  updateSessionStats: (minutes: number, completed: boolean) => void;
  resetAllStats: () => void;
}

const defaultStats: Statistics = {
  totalSessions: 0,
  totalMinutes: 0,
  completedSessions: 0,
  averageSessionMinutes: 0,
  lastUpdated: new Date().toISOString(),
  dailyStats: {}
};

const STATS_KEY = 'focusStats';

const StatisticsContext = createContext<StatisticsContextType | null>(null);

export const useStatistics = () => {
  const context = useContext(StatisticsContext);
  if (!context) {
    throw new Error('useStatistics must be used within a StatisticsProvider');
  }
  return context;
};

export const StatisticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [statistics, setStatistics] = useState<Statistics>(defaultStats);

  // Load stats from localStorage only if they exist and aren't all zeros
  useEffect(() => {
    const savedStats = localStorage.getItem(STATS_KEY);
    if (savedStats) {
      const parsedStats = JSON.parse(savedStats);
      // Only set the stats if they're not all zeros
      if (parsedStats.totalSessions > 0 || parsedStats.totalMinutes > 0 || parsedStats.completedSessions > 0) {
        setStatistics(parsedStats);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STATS_KEY, JSON.stringify(statistics));
  }, [statistics]);

  const updateSessionStats = (minutes: number, completed: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    
    setStatistics(prev => {
      // Update daily stats
      const currentDayStats = prev.dailyStats[today] || { sessions: 0, minutes: 0, completed: 0 };
      const updatedDayStats = {
        sessions: currentDayStats.sessions + 1,
        minutes: currentDayStats.minutes + minutes,
        completed: currentDayStats.completed + (completed ? 1 : 0)
      };

      // Calculate new totals
      const newTotalSessions = prev.totalSessions + 1;
      const newTotalMinutes = prev.totalMinutes + minutes;
      const newCompletedSessions = prev.completedSessions + (completed ? 1 : 0);
      const newAverageMinutes = Math.round(newTotalMinutes / newTotalSessions);

      return {
        ...prev,
        totalSessions: newTotalSessions,
        totalMinutes: newTotalMinutes,
        completedSessions: newCompletedSessions,
        averageSessionMinutes: newAverageMinutes,
        lastUpdated: new Date().toISOString(),
        dailyStats: {
          ...prev.dailyStats,
          [today]: updatedDayStats
        }
      };
    });
  };

  const resetAllStats = () => {
    // First clear localStorage
    localStorage.removeItem(STATS_KEY);
    
    // Then set state to default stats
    setStatistics({
      totalSessions: 0,
      totalMinutes: 0,
      completedSessions: 0,
      averageSessionMinutes: 0,
      lastUpdated: new Date().toISOString(),
      dailyStats: {}
    });

    // Force a save of the zeroed stats
    localStorage.setItem(STATS_KEY, JSON.stringify(defaultStats));

    // Force reload the page to ensure everything is reset
    window.location.reload();
  };

  return (
    <StatisticsContext.Provider value={{ statistics, updateSessionStats, resetAllStats }}>
      {children}
    </StatisticsContext.Provider>
  );
};
