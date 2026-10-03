import React from 'react';
import { GitBranch, Code2, Sparkles, Loader2, Compass } from 'lucide-react';

const PRESETS = [
  {
    name: 'React Hyderabad Hack Day',
    repo: 'reacthyderabad/hacktoberfest-hack-day-2026',
    skills: 'JavaScript, React, Beginner',
    level: 'Beginner',
  },
  {
    name: 'Flask (Python)',
    repo: 'pallets/flask',
    skills: 'Python, docs, bug fixes',
    level: 'Beginner',
  },
  {
    name: 'FastAPI (Python)',
    repo: 'fastapi/fastapi',
    skills: 'Python, Type hints, Beginner',
    level: 'Beginner',
  },
  {
    name: 'Next.js',
    repo: 'vercel/next.js',
    skills: 'React, TypeScript, Next.js',
    level: 'Intermediate',
  },
];

export default function RepoInput({
  repoUrl,
  setRepoUrl,
  userSkills,
  setUserSkills,
  experienceLevel,
  setExperienceLevel,
  onAnalyze,
  loading,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    onAnalyze();
  };

  const handleApplyPreset = (preset) => {
    setRepoUrl(preset.repo);
    setUserSkills(preset.skills);
    setExperienceLevel(preset.level);
  };

  return (
    <div className="glass-panel search-card">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* GitHub Repo URL */}
          <div className="input-group">
            <label className="input-label" htmlFor="repo-url">
              <GitBranch size={17} color="#2563EB" />
              <span>Public GitHub Repository</span>
            </label>
            <div className="input-field-wrapper">
              <span className="input-icon">
                <Compass size={20} color="#000000" />
              </span>
              <input
                id="repo-url"
                type="text"
                className="input-field"
                placeholder="https://github.com/owner/repo or owner/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                required
              />
            </div>
          </div>

          {/* User Skills */}
          <div className="input-group">
            <label className="input-label" htmlFor="user-skills">
              <Code2 size={17} color="#059669" />
              <span>Your Skills & Experience</span>
            </label>
            <div className="input-field-wrapper">
              <span className="input-icon">
                <Code2 size={20} color="#000000" />
              </span>
              <input
                id="user-skills"
                type="text"
                className="input-field"
                placeholder="e.g. JavaScript, React, Beginner"
                value={userSkills}
                onChange={(e) => setUserSkills(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !repoUrl.trim()}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="spinner" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>Find My First PR</span>
              </>
            )}
          </button>
        </div>

        {/* Quick presets */}
        <div className="quick-tags">
          <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.85rem' }}>⚡ Quick Samples:</span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              className="quick-tag-chip"
              onClick={() => handleApplyPreset(p)}
              disabled={loading}
            >
              {p.name}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
