import React, { useState, useEffect } from 'react';
import { X, Key, Shield, ExternalLink, Check, Cpu } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, keys, onSaveKeys, serverConfig }) {
  const [groqKey, setGroqKey] = useState(keys.groqKey || '');
  const [githubToken, setGithubToken] = useState(keys.githubToken || '');
  const [selectedModel, setSelectedModel] = useState(keys.model || serverConfig?.model || 'openai/gpt-oss-120b');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setGroqKey(keys.groqKey || '');
    setGithubToken(keys.githubToken || '');
    if (keys.model) setSelectedModel(keys.model);
    else if (serverConfig?.model) setSelectedModel(serverConfig.model);
  }, [keys, serverConfig]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveKeys({
      groqKey: groqKey.trim(),
      githubToken: githubToken.trim(),
      model: selectedModel,
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
            <Key size={20} color="#818cf8" />
            <h3 style={{ fontSize: '1.2rem' }}>API Configuration</h3>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="input-group" style={{ marginBottom: '18px' }}>
            <label className="input-label" htmlFor="groq-key">
              <span>Groq API Key</span>
              {serverConfig?.hasGroqKey && (
                <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 600 }}>
                  (Detected in .env)
                </span>
              )}
            </label>
            <div className="input-field-wrapper">
              <input
                id="groq-key"
                type="password"
                className="input-field"
                style={{ paddingLeft: '14px' }}
                placeholder={serverConfig?.hasGroqKey ? 'Configured on server (override here)' : 'gsk_...'}
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
              />
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Groq provides fast, free inference for Llama 3.3 70B.{' '}
              <a 
                href="https://console.groq.com/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#818cf8', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
              >
                Get a free key <ExternalLink size={12} />
              </a>
            </p>
          </div>

          <div className="input-group" style={{ marginBottom: '18px' }}>
            <label className="input-label" htmlFor="model-select">
              <Cpu size={15} color="#06b6d4" />
              <span>Open-Weight Model</span>
            </label>
            <div className="input-field-wrapper">
              <select
                id="model-select"
                className="input-field"
                style={{ paddingLeft: '14px', appearance: 'auto', background: 'var(--bg-input)' }}
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option value="openai/gpt-oss-120b">GPT OSS 120B (High Reasoning, Open Weights)</option>
                <option value="openai/gpt-oss-20b">GPT OSS 20B (Fast, Open Weights)</option>
                <option value="qwen/qwen3.8-27b">Qwen 3.8 27B (Open Weights)</option>
              </select>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Note: Google's Gemma 2 (<code>gemma2-9b-it</code>) was decommissioned on Groq Cloud. <code>GPT OSS 120B</code> and <code>20B</code> are active open-weight models with instant inference.
            </p>
          </div>

          <div className="input-group" style={{ marginBottom: '22px' }}>
            <label className="input-label" htmlFor="github-token">
              <span>GitHub Personal Access Token (Optional)</span>
              {serverConfig?.hasGithubToken && (
                <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 600 }}>
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
                placeholder={serverConfig?.hasGithubToken ? 'Configured on server (override here)' : 'ghp_...'}
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
              />
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Recommended to avoid GitHub rate limits on shared hackathon networks (increases limit to 5,000 req/hr).
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            fontSize: '0.78rem',
            color: 'var(--text-dim)',
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
