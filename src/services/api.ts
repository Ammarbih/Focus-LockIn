interface Stats {
  totalSessions: number;
  totalMinutes: number;
  completedSessions: number;
  averageSessionMinutes: number;
  lastUpdated: string;
}

const STATS_KEY = 'focus_lockin_stats';

export const updateStats = (minutes: number, completed: boolean) => {
  const currentStats = getStats();
  const newStats = {
    totalSessions: currentStats.totalSessions + 1,
    totalMinutes: currentStats.totalMinutes + minutes,
    completedSessions: currentStats.completedSessions + (completed ? 1 : 0),
    averageSessionMinutes: Math.round((currentStats.totalMinutes + minutes) / (currentStats.totalSessions + 1)),
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
  return newStats;
};

export const getStats = (): Stats => {
  const defaultStats: Stats = {
    totalSessions: 0,
    totalMinutes: 0,
    completedSessions: 0,
    averageSessionMinutes: 0,
    lastUpdated: new Date().toISOString()
  };

  const storedStats = localStorage.getItem(STATS_KEY);
  return storedStats ? JSON.parse(storedStats) : defaultStats;
};