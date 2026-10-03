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
          <div className="stat-item" style={{ background: '#DBEAFE' }} title="Primary Language">
            <Code size={18} color="#000000" />
            <span>{repoInfo.language}</span>
          </div>
        )}
        <div className="stat-item" style={{ background: '#FEF08A' }} title="GitHub Stars">
          <Star size={18} color="#000000" />
          <span>{repoInfo.stars?.toLocaleString()} stars</span>
        </div>
        <div className="stat-item" style={{ background: '#D1FAE5' }} title="Forks">
          <GitFork size={18} color="#000000" />
          <span>{repoInfo.forks?.toLocaleString()} forks</span>
        </div>
        <div className="stat-item" style={{ background: '#FFE4E6' }} title="Open Issues">
          <AlertCircle size={18} color="#000000" />
          <span>{repoInfo.openIssuesCount} open issues</span>
        </div>
      </div>
    </div>
  );
}
