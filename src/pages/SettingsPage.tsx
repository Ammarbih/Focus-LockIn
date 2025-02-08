import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme } from '../contexts/ThemeContext';
import './SettingsPage.css';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="settings-page">
      <h1>Instellingen</h1>
      
      <div className="settings-section">
        <div className="setting-item">
          <div className="setting-label">
            <h3>Geluid</h3>
            <p>Speel een geluid af wanneer de timer klaar is</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <h3>Thema</h3>
            <p>{theme === 'dark' ? 'Donker' : 'Licht'} thema</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={theme === 'light'}
              onChange={toggleTheme}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;