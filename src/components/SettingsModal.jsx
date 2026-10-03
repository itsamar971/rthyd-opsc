import React, { useState, useEffect } from 'react';
import { X, Key, Shield, ExternalLink, Check } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, keys, onSaveKeys, serverConfig }) {
  const [githubToken, setGithubToken] = useState(keys.githubToken || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setGithubToken(keys.githubToken || '');
  }, [keys]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveKeys({
      ...keys,
      githubToken: githubToken.trim(),
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Key size={20} color="#000000" />
            <h3 style={{ fontSize: '1.25rem' }}>GitHub Token Settings</h3>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>

          <div className="input-group" style={{ marginBottom: '22px' }}>
            <label className="input-label" htmlFor="github-token">
              <span>GitHub Personal Access Token (Optional)</span>
              {serverConfig?.hasGithubToken && (
                <span style={{ color: '#059669', fontSize: '0.75rem', fontWeight: 800 }}>
                  (Detected in .env)
                </span>
              )}
            </label>
            <div className="input-field-wrapper">
              <input
                id="github-token"
                type="password"
                className="input-field"
                style={{ paddingLeft: '14px' }}
                placeholder={serverConfig?.hasGithubToken ? 'Configured in .env (override here)' : 'ghp_...'}
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
              />
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
              Recommended to avoid GitHub rate limits on shared hackathon networks (increases limit to 5,000 req/hr).
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '0px',
            border: '2px solid #000000',
            background: '#F1F5F9',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#000000',
            marginBottom: '16px'
          }}>
            <Shield size={16} color="#94a3b8" />
            <span>Keys entered here stay strictly in your browser's localStorage or request session.</span>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '10px 22px' }}>
              {saved ? (
                <>
                  <Check size={16} /> Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
