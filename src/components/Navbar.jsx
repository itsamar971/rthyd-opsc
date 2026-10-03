import React from 'react';
import { Sparkles, Settings, Github } from 'lucide-react';

export default function Navbar({ onOpenSettings, hasCustomKey }) {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <div className="brand">
          <div className="brand-icon">
            <Sparkles size={22} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>First-PR Finder</span>
            <span className="brand-badge">Hacktoberfest '26</span>
          </div>
        </div>

        <div className="nav-actions">
          <button 
            type="button" 
            className="btn-ghost" 
            onClick={onOpenSettings}
            title="Configure Groq API Key & GitHub Token"
          >
            <Settings size={16} />
            <span>API Settings</span>
            {hasCustomKey && (
              <span style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                background: '#10b981', 
                display: 'inline-block' 
              }} />
            )}
          </button>

          <a 
            href="https://github.com/itsamar971/rthyd-opsc" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-ghost"
            title="View project on GitHub"
          >
            <Github size={16} />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
