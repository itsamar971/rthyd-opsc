import React from 'react';
import { Loader2, Check } from 'lucide-react';

const STEPS = [
  'Connecting to GitHub API',
  'Analyzing repository file tree & README',
  'Filtering open issues & discussion context',
  'Groq + Llama 3.3 70B matching your skills',
  'Synthesizing file map & first steps',
];

export default function LoadingSteps({ currentStep }) {
  return (
    <div className="glass-panel loading-box">
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#c7d2fe', marginBottom: '8px' }}>
        <Loader2 size={24} className="spinner" color="#818cf8" />
        <h3 style={{ fontSize: '1.25rem' }}>Analyzing Repository & Issues...</h3>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto' }}>
        Our open-weight AI model is scanning the codebase structure and cross-referencing open tickets with your experience.
      </p>

      <div className="loading-steps">
        {STEPS.map((step, idx) => {
          const isDone = currentStep > idx;
          const isActive = currentStep === idx;

          return (
            <div
              key={step}
              className={`step-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
            >
              <div className="step-dot">
                {isDone ? <Check size={14} /> : idx + 1}
              </div>
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
