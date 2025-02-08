import React from 'react';
import { useStatistics } from '../contexts/StatisticsContext';
import './StatsPage.css';

const StatsPage: React.FC = () => {
  const { statistics, resetAllStats } = useStatistics();

  const formatMinutes = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const calculateCompletionRate = (): number => {
    if (statistics.totalSessions === 0) return 0;
    return Math.round((statistics.completedSessions / statistics.totalSessions) * 100);
  };

  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    return statistics.dailyStats[today] || { sessions: 0, minutes: 0, completed: 0 };
  };

  const handleReset = () => {
    if (window.confirm('Weet je zeker dat je alle statistieken wilt resetten? Dit kan niet ongedaan worden gemaakt.')) {
      resetAllStats();
    }
  };

  const todayStats = getTodayStats();
  const completionRate = calculateCompletionRate();

  return (
    <div className="stats-page">
      <div className="stats-header">
        <h1>Statistieken</h1>
        <button onClick={handleReset} className="reset-button">
          Reset Statistieken
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <h3>Vandaag</h3>
            <div className="stat-value">{formatMinutes(todayStats.minutes)}</div>
            <p className="stat-subtitle">{todayStats.sessions} sessies</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>Totale Focus Tijd</h3>
            <div className="stat-value">{formatMinutes(statistics.totalMinutes)}</div>
            <p className="stat-subtitle">{statistics.totalSessions} sessies in totaal</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>Gemiddelde Sessie</h3>
            <div className="stat-value">{formatMinutes(statistics.averageSessionMinutes)}</div>
            <p className="stat-subtitle">per focus sessie</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>Voltooiingspercentage</h3>
            <div className="stat-value">{completionRate}%</div>
            <p className="stat-subtitle">{statistics.completedSessions} voltooide sessies</p>
            <div className="stat-progress">
              <div 
                className="stat-progress-bar" 
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;