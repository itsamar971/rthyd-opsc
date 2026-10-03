/**
 * Groq AI Matchmaker Service (Llama 3.3 70B)
 */
import Groq from 'groq-sdk';

export async function getRecommendations({ repoInfo, fileTree, issues, userSkills, apiKey }) {
  // Strategy 1: Try server API route (/api/recommend)
  try {
    const res = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repoInfo,
        fileTree,
        issues,
        userSkills,
        apiKey,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.recommendations && data.recommendations.length > 0) {
        return data.recommendations;
      }
    } else {
      const errData = await res.json().catch(() => ({}));
      // If server returned an explicit error message, check if it's missing key
      if (errData.error && !apiKey) {
        throw new Error(errData.error);
      }
    }
  } catch (serverErr) {
    // If server error was missing key, pass it along
    if (serverErr.message && serverErr.message.includes('GROQ_API_KEY')) {
      throw serverErr;
    }
    console.warn('Server recommendation endpoint unavailable, trying direct client...', serverErr);
  }

  // Strategy 2: Direct browser SDK call if apiKey is provided
  if (apiKey && apiKey.trim()) {
    const groq = new Groq({
      apiKey: apiKey.trim(),
      dangerouslyAllowBrowser: true,
    });

    const systemPrompt = `You are First-PR Finder, an expert open-source mentor helping newcomers make their first successful pull request.
Your job is to analyze candidate open issues against contributor skill level and repository structure, selecting the TOP 3 BEST issues.

Format output as strict JSON:
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
- Skills & Level: ${userSkills || 'Beginner'}

Repository: ${repoInfo?.fullName} (${repoInfo?.description || 'N/A'})
Primary Language: ${repoInfo?.language || 'Unknown'}

Available File Tree Sample:
${(fileTree || []).slice(0, 60).map(f => f.path).join('\n')}

Candidate Issues:
${(issues || []).slice(0, 15).map(issue => `
#${issue.number}: ${issue.title}
URL: ${issue.html_url}
Labels: ${(issue.labels || []).map(l => l.name).join(', ')}
Snippet: ${(issue.body || '').slice(0, 350)}
`).join('\n')}
`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 3000,
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    if (parsed.recommendations && parsed.recommendations.length > 0) {
      return parsed.recommendations;
    }
  }

  throw new Error('Please configure your GROQ_API_KEY in .env or the Settings panel to analyze with Llama 3.3 70B.');
}
