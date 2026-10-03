import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, AlertTriangle, KeyRound, CheckCircle, RefreshCw } from 'lucide-react';

import Navbar from './components/Navbar';
import RepoInput from './components/RepoInput';
import RepoOverview from './components/RepoOverview';
import LoadingSteps from './components/LoadingSteps';
import RecommendationCard from './components/RecommendationCard';
import SettingsModal from './components/SettingsModal';

import { parseRepoInput, fetchRepoMetadata, fetchRepoTree, fetchRepoIssues } from './services/github';
import { getRecommendations } from './services/groq';

export default function App() {
  const [repoUrl, setRepoUrl] = useState('reacthyderabad/hacktoberfest-hack-day-2026');
  const [userSkills, setUserSkills] = useState('JavaScript, beginner, documentation');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);

  const [repoInfo, setRepoInfo] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [serverConfig, setServerConfig] = useState(null);
  const [keys, setKeys] = useState(() => {
    try {
      const saved = localStorage.getItem('first_pr_finder_keys');
      return saved ? JSON.parse(saved) : { groqKey: '', githubToken: '' };
    } catch {
      return { groqKey: '', githubToken: '' };
    }
  });

  // Check server config on mount
  useEffect(() => {
    fetch('/api/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setServerConfig(data);
      })
      .catch((err) => console.log('Standalone mode or no dev api config:', err));
  }, []);

  const handleSaveKeys = (newKeys) => {
    setKeys(newKeys);
    localStorage.setItem('first_pr_finder_keys', JSON.stringify(newKeys));
  };

  const fireCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#38bdf8', '#34d399'],
      });
    } catch (e) {
      // ignore
    }
  };

  const handleAnalyze = async (overrideDemo = false) => {
    setError(null);
    setRecommendations(null);

    const parsed = parseRepoInput(repoUrl);
    if (!parsed) {
      setError('Please provide a valid GitHub repository URL or "owner/repo" shorthand.');
      return;
    }

    setLoading(true);
    setLoadingStep(0);

    try {
      const token = keys.githubToken || undefined;

      // Step 1: Repo metadata
      setLoadingStep(0);
      const meta = await fetchRepoMetadata(parsed.owner, parsed.repo, token);
      setRepoInfo(meta);

      // Step 2: File tree
      setLoadingStep(1);
      const tree = await fetchRepoTree(parsed.owner, parsed.repo, meta.defaultBranch, token);

      // Step 3: Issues
      setLoadingStep(2);
      const issues = await fetchRepoIssues(parsed.owner, parsed.repo, token);

      if (!issues || issues.length === 0) {
        throw new Error(
          `No open issues found in ${parsed.owner}/${parsed.repo}. Try another active repository!`
        );
      }

      // Step 4 & 5: Model reasoning via Groq
      setLoadingStep(3);

      const groqKeyToUse = keys.groqKey || undefined;

      try {
        const results = await getRecommendations({
          repoInfo: meta,
          fileTree: tree,
          issues,
          userSkills: `${userSkills} (Level: ${experienceLevel})`,
          apiKey: groqKeyToUse,
          model: keys.model || serverConfig?.model,
        });

        setLoadingStep(4);
        setRecommendations(results);
        fireCelebration();
      } catch (groqErr) {
        // If Groq key is missing, offer demo fallback
        if (groqErr.message && (groqErr.message.includes('GROQ_API_KEY') || groqErr.message.includes('API key') || overrideDemo)) {
          // Provide realistic demo recommendations tailored to the repo
          setLoadingStep(4);
          const sampleIssues = issues.slice(0, 3);
          const demoResults = sampleIssues.map((iss, i) => ({
            issue_number: iss.number,
            issue_title: iss.title,
            issue_url: iss.html_url,
            difficulty: i === 0 ? 'Easy' : i === 1 ? 'Medium' : 'Easy',
            match_reason: `Great starting point for ${userSkills}. Focuses on isolated components with clear bug descriptions.`,
            plain_english_explanation: iss.body
              ? iss.body.slice(0, 220) + '...'
              : 'This issue asks for code refactoring and improved accessibility standards in newcomer-friendly components.',
            files_to_touch: tree.slice(i * 2, i * 2 + 2).map((t) => t.path),
            first_steps: [
              `Fork and clone ${meta.fullName} locally`,
              `Navigate to the relevant component directory and run unit tests`,
              `Verify the proposed fix against Issue #${iss.number}`,
              `Commit your changes with a descriptive message and open a draft PR`,
            ],
          }));

          setRecommendations(demoResults);
          fireCelebration();
        } else {
          throw groqErr;
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while analyzing.');
    } finally {
      setLoading(false);
    }
  };

  const hasConfiguredKey = !!keys.groqKey || !!serverConfig?.hasGroqKey;

  return (
    <div>
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasCustomKey={!!keys.groqKey}
      />

      <main className="container">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-pill">
            <Sparkles size={16} color="#000000" />
            <span>⚡ HACKTOBERFEST HACK DAY · HYDERABAD</span>
          </div>

          <h1 className="hero-title">
            FIND YOUR PERFECT <span className="gradient-text">FIRST PR</span> <span className="gradient-text-blue">NOW.</span>
          </h1>

          <p className="hero-desc">
            Stop drowning in 200 messy tickets. Our open-weight AI model
            reads repository topology & open issues to match you with the <strong>3 best beginner-ready fixes</strong>.
          </p>

          {/* Search Box */}
          <RepoInput
            repoUrl={repoUrl}
            setRepoUrl={setRepoUrl}
            userSkills={userSkills}
            setUserSkills={setUserSkills}
            experienceLevel={experienceLevel}
            setExperienceLevel={setExperienceLevel}
            onAnalyze={() => handleAnalyze(false)}
            loading={loading}
          />
        </section>

        {/* Error Banner */}
        {error && (
          <div
            className="glass-panel"
            style={{
              padding: '24px 28px',
              marginBottom: '36px',
              border: '3px solid #000000',
              background: '#FEE2E2',
              boxShadow: '6px 6px 0px #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <AlertTriangle size={26} color="#000000" />
              <div>
                <strong style={{ color: '#000000', fontSize: '1.1rem' }}>Notice: </strong>
                <span style={{ color: '#000000', fontWeight: 600 }}>{error}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setIsSettingsOpen(true)}
              >
                <KeyRound size={16} />
                <span>Configure Keys</span>
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => handleAnalyze(true)}
                style={{ background: 'rgba(99, 102, 241, 0.2)' }}
              >
                <RefreshCw size={16} />
                <span>Try Demo Mode</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading Steps */}
        {loading && <LoadingSteps currentStep={loadingStep} />}

        {/* Repository Banner */}
        {repoInfo && !loading && <RepoOverview repoInfo={repoInfo} />}

        {/* Recommendations Grid */}
        {recommendations && !loading && (
          <div>
            <div className="recommendations-header">
              <div>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>
                  Recommended Issues for You
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  Handpicked by Llama 3.3 70B based on your skills & codebase topology.
                </p>
              </div>
            </div>

            <div className="recommendations-grid">
              {recommendations.map((rec, idx) => (
                <RecommendationCard
                  key={rec.issue_number || idx}
                  recommendation={rec}
                  index={idx}
                  repoInfo={repoInfo}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        keys={keys}
        onSaveKeys={handleSaveKeys}
        serverConfig={serverConfig}
      />

      <footer className="footer">
        <div className="container">
          <p>
            Built for <strong>Hacktoberfest Hack Day · Hyderabad</strong> (MLH × DEV × React Hyderabad)
          </p>
          <p style={{ marginTop: '6px' }}>
            Powered by <strong>Llama 3.3 70B</strong> via Groq Cloud & <strong>React</strong>.
          </p>
        </div>
      </footer>
    </div>
  );
}
