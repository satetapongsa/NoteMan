import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="app">
      <header className="app-header glass">
        <div className="header-left">
          <h1 className="app-logo gradient-text">NoteFlow</h1>
        </div>
        <div className="header-right">
          <button onClick={toggleTheme} className="theme-btn">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <div className="app-content">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title gradient-text">Notes</h2>
            <button className="btn-primary">+ New</button>
          </div>
          
          <div className="sidebar-search">
            <input type="text" placeholder="Search notes..." />
          </div>

          <div className="sidebar-section">
            <div className="section-title">Quick Access</div>
            <div className="quick-links">
              <button className="quick-link">
                <span>❤️ Favorites</span>
                <span className="count">0</span>
              </button>
              <button className="quick-link">
                <span>🕐 Recent</span>
                <span className="count">0</span>
              </button>
            </div>
          </div>

          <div className="sidebar-section flex-1">
            <div className="section-title">All Notes (0)</div>
            <div className="empty-state">
              <p>📝</p>
              <p>No notes yet</p>
              <button className="btn-primary">Create your first note</button>
            </div>
          </div>
        </aside>

        <main className="main-content">
          <div className="editor-empty-state">
            <div className="empty-state-content">
              <div className="empty-icon">📄</div>
              <h2>Welcome to NoteFlow</h2>
              <p>Select a note to start editing or create a new one</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
