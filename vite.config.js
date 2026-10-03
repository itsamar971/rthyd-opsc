import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

// Custom Vite plugin to handle backend API routes in dev mode
function apiPlugin() {
  const handleApi = async (req, res, next) => {
    const url = new URL(req.url, 'http://localhost');
    const pathname = url.pathname;

    // GET /api/config
    if (req.method === 'GET' && (pathname === '/api/config' || pathname === '/api/config/')) {
      const groqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
      const ghToken = process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        hasGroqKey: !!groqKey,
        hasGithubToken: !!ghToken,
        githubToken: ghToken || '',
        model: process.env.GROQ_MODEL || process.env.VITE_GROQ_MODEL || 'openai/gpt-oss-120b',
      }));
      return;
    }

    // POST /api/recommend
    if (req.method === 'POST' && (pathname === '/api/recommend' || pathname === '/api/recommend/')) {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const groqApiKey = data.apiKey || process.env.GROQ_API_KEY;

              if (!groqApiKey) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  error: 'GROQ_API_KEY is required. Please set it in .env or provide it in the API settings.',
                }));
                return;
              }

              const groq = new Groq({ apiKey: groqApiKey });
              const model = data.model || process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

              const systemPrompt = `You are First-PR Finder, an expert open-source mentor helping newcomers make their first successful pull request.
Your job is to analyze the candidate open issues in a GitHub repository against the contributor's skill set and repo structure, and select the TOP 3 BEST issues for this contributor.

CRITICAL INSTRUCTIONS:
1. Choose exactly 3 issues (or fewer if total available issues is less than 3) that are realistic and accessible for the contributor.
2. For each issue:
   - Provide a "plain_english_explanation": explain what the bug/feature is asking for in simple, friendly terms without jargon.
   - Provide "difficulty": "Easy", "Medium", or "Hard" relative to the user's skill.
   - Provide "match_reason": why this issue fits the contributor's declared skills.
   - Provide "files_to_touch": list 1-4 concrete file paths selected from the provided repository file tree that the contributor will likely need to inspect or edit.
   - Provide "first_steps": a step-by-step array of 3-4 actionable bullet points on how to get started, reproduce, or locate the fix.

Output strictly valid JSON matching this exact structure:
{
  "recommendations": [
    {
      "issue_number": 123,
      "issue_title": "string",
      "issue_url": "string",
      "difficulty": "Easy" | "Medium" | "Hard",
      "match_reason": "string",
      "plain_english_explanation": "string",
      "files_to_touch": ["path/to/file1.ext", "path/to/file2.ext"],
      "first_steps": ["step 1", "step 2", "step 3"]
    }
  ]
}`;

              const userPrompt = `Contributor Profile:
- Skills & Level: ${data.userSkills || 'Beginner'}

Repository Information:
- Full Name: ${data.repoInfo?.fullName}
- Description: ${data.repoInfo?.description || 'N/A'}
- Primary Language: ${data.repoInfo?.language || 'Unknown'}

Sample Repository File Tree:
${(data.fileTree || []).slice(0, 75).map(f => f.path).join('\n')}

Candidate Open Issues (${(data.issues || []).length} available):
${(data.issues || []).map(issue => `
---
Issue #${issue.number}: ${issue.title}
URL: ${issue.html_url}
Labels: ${(issue.labels || []).map(l => l.name).join(', ')}
Body preview: ${(issue.body || '').slice(0, 500)}
`).join('\n')}

Analyze these issues carefully, pick the top 3 best matching issues for the contributor, and output the required JSON.`;

              const completion = await groq.chat.completions.create({
                model,
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: userPrompt },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.2,
                max_tokens: 3000,
              });

              const responseText = completion.choices[0]?.message?.content || '{}';
              const parsed = JSON.parse(responseText);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(parsed));
            } catch (err) {
              console.error('API Error:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                error: err.message || 'Failed to generate recommendations from Groq.',
              }));
            }
          });
          return;
        }

        next();
      };

      return {
        name: 'first-pr-api-plugin',
        configureServer(server) {
          server.middlewares.use(handleApi);
        },
        configurePreviewServer(server) {
          server.middlewares.use(handleApi);
        },
      };
    }

export default defineConfig({
  plugins: [react(), apiPlugin()],
  server: {
    port: 5173,
    host: true,
  },
});
