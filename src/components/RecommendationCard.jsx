import React, { useState } from 'react';
import { 
  FileCode, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Flame, 
  Target, 
  Sparkles 
} from 'lucide-react';

const RANK_LABELS = [
  { label: '#1 Top Pick', icon: Sparkles },
  { label: '#2 Great Fit', icon: Target },
  { label: '#3 Alternative', icon: Flame },
];

export default function RecommendationCard({ recommendation, index, repoInfo }) {
  const [copiedFile, setCopiedFile] = useState(null);

  const rank = RANK_LABELS[index] || { label: `#${index + 1} Recommendation`, icon: Sparkles };
  const RankIcon = rank.icon;

  const diffLower = (recommendation.difficulty || 'medium').toLowerCase();
  const diffClass = diffLower === 'easy' 
    ? 'difficulty-easy' 
    : diffLower === 'hard' 
      ? 'difficulty-hard' 
      : 'difficulty-medium';

  const copyToClipboard = (path) => {
    navigator.clipboard.writeText(path);
    setCopiedFile(path);
    setTimeout(() => setCopiedFile(null), 1500);
  };

  const issueUrl = recommendation.issue_url || 
    (repoInfo?.htmlUrl ? `${repoInfo.htmlUrl}/issues/${recommendation.issue_number}` : '#');

  return (
    <div className="glass-panel issue-card">
      <div className="issue-card-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="issue-rank-badge">
            <RankIcon size={14} />
            <span>{rank.label}</span>
          </div>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            Issue #{recommendation.issue_number}
          </span>
        </div>

        <div className={`difficulty-badge ${diffClass}`}>
          <span>Difficulty: {recommendation.difficulty || 'Medium'}</span>
        </div>
      </div>

      <h3 className="issue-title">
        <a href={issueUrl} target="_blank" rel="noopener noreferrer">
          {recommendation.issue_title}
        </a>
      </h3>

      {recommendation.match_reason && (
        <div className="match-reason-box">
          <strong>Why this fits: </strong> {recommendation.match_reason}
        </div>
      )}

      <div>
        <div className="section-label">
          <span>What this issue is asking</span>
        </div>
        <p className="explanation-text">
          {recommendation.plain_english_explanation}
        </p>
      </div>

      {recommendation.files_to_touch && recommendation.files_to_touch.length > 0 && (
        <div>
          <div className="section-label">
            <FileCode size={16} color="#2563EB" />
            <span>Files you'll likely need to touch</span>
          </div>
          <div className="files-chips">
            {recommendation.files_to_touch.map((filePath) => (
              <span key={filePath} className="file-chip">
                <span>{filePath}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(filePath)}
                  title="Copy file path"
                  style={{ color: copiedFile === filePath ? '#059669' : '#000000', display: 'flex' }}
                >
                  {copiedFile === filePath ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {recommendation.first_steps && recommendation.first_steps.length > 0 && (
        <div>
          <div className="section-label">
            <CheckCircle2 size={16} color="#059669" />
            <span>First steps to start fixing</span>
          </div>
          <ol className="steps-list">
            {recommendation.first_steps.map((step, idx) => (
              <li key={idx} className="step-row">
                <span className="step-num">{idx + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="card-footer">
        <a
          href={issueUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-github"
        >
          <span>Open Issue #{recommendation.issue_number} on GitHub</span>
          <ExternalLink size={15} />
        </a>
      </div>
    </div>
  );
}
