import { useState, useEffect } from 'react';
import './App.css';
import HomeScreen from './components/HomeScreen';
import GameScreen from './components/GameScreen';
import AdminPanel from './components/AdminPanel';
import { useTranslation } from './i18n.jsx';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [gameConfig, setGameConfig] = useState(null);
  const { language, changeLanguage, t } = useTranslation();

  const handleStartGame = (selectedCharacters, duration, complexCharacters, discussionDuration) => {
    setGameConfig({
      selectedCharacters,
      duration,
      complexCharacters,
      discussionDuration
    });
    setCurrentScreen('game');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
    setGameConfig(null);
  };

  const handleAdminToggle = () => {
    setCurrentScreen(currentScreen === 'admin' ? 'home' : 'admin');
  };

  return (
    <div className="app">
      <div className="app-header">
        <div className="app-title">
          <img src="/logo-alfa.png" alt="" className="app-logo" />
          <h1>{t('appTitle')}</h1>
        </div>
        <div className="header-controls">
          <div className="language-switcher">
            <button
              className={`flag-button ${language === 'no' ? 'active' : ''}`}
              onClick={() => changeLanguage('no')}
              title="Norsk"
            >
              🇳🇴
            </button>
            <button
              className={`flag-button ${language === 'en' ? 'active' : ''}`}
              onClick={() => changeLanguage('en')}
              title="English"
            >
              🇬🇧
            </button>
          </div>
          <button
            className="admin-toggle"
            onClick={handleAdminToggle}
            title="Admin"
          >
            {t('adminButton')}
          </button>
        </div>
      </div>
      
      <div className="app-content">
        {currentScreen === 'home' && (
          <HomeScreen onStartGame={handleStartGame} />
        )}
        {currentScreen === 'game' && gameConfig && (
          <GameScreen 
            config={gameConfig}
            onGameEnd={handleBackToHome}
          />
        )}
        {currentScreen === 'admin' && (
          <AdminPanel onClose={() => setCurrentScreen('home')} />
        )}
      </div>
    </div>
  );
}

export default App;
