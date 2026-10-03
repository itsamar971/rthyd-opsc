import React from 'react';
import { Star, GitFork, AlertCircle, Code, ExternalLink } from 'lucide-react';

export default function RepoOverview({ repoInfo }) {
  if (!repoInfo) return null;

  return (
    <div className="glass-panel repo-banner">
      <div className="repo-info-main">
        <h2>
          <span>{repoInfo.fullName}</span>
          <a
            href={repoInfo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open on GitHub"
            style={{ color: 'var(--text-dim)', display: 'inline-flex' }}
          >
            <ExternalLink size={18} />
          </a>
        </h2>
        {repoInfo.description && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '750px' }}>
            {repoInfo.description}
          </p>
        )}
      </div>

      <div className="repo-stats">
        {repoInfo.language && (
          <div className="stat-item" title="Primary Language">
            <Code size={16} color="#60a5fa" />
            <span>{repoInfo.language}</span>
          </div>
        )}
        <div className="stat-item" title="GitHub Stars">
          <Star size={16} color="#facc15" />
          <span>{repoInfo.stars?.toLocaleString()}</span>
        </div>
        <div className="stat-item" title="Forks">
          <GitFork size={16} color="#c084fc" />
          <span>{repoInfo.forks?.toLocaleString()}</span>
        </div>
        <div className="stat-item" title="Open Issues">
          <AlertCircle size={16} color="#f87171" />
          <span>{repoInfo.openIssuesCount} issues</span>
        </div>
      </div>
    </div>
  );
}
