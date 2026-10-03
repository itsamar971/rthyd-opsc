/**
 * GitHub REST API Service
 */

// Parse URL or "owner/repo" shorthand
export function parseRepoInput(input) {
  if (!input) return null;
  const clean = input.trim().replace(/\.git$/, '');
  
  // Format: https://github.com/owner/repo or github.com/owner/repo
  const urlMatch = clean.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)/);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] };
  }

  // Format: owner/repo
  const shortMatch = clean.match(/^([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)$/);
  if (shortMatch) {
    return { owner: shortMatch[1], repo: shortMatch[2] };
  }

  return null;
}

function getHeaders(token) {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token && token.trim()) {
    headers['Authorization'] = `Bearer ${token.trim()}`;
  }
  return headers;
}

export async function fetchRepoMetadata(owner, repo, token) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: getHeaders(token),
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Repository ${owner}/${repo} not found. Ensure it is public or check the spelling.`);
    }
    if (res.status === 403) {
      throw new Error(`GitHub API rate limit exceeded. Add a personal access token in Settings to increase limit.`);
    }
    throw new Error(`Failed to fetch repo metadata (HTTP ${res.status})`);
  }

  const data = await res.json();
  return {
    name: data.name,
    fullName: data.full_name,
    description: data.description,
    stars: data.stargazers_count,
    forks: data.forks_count,
    openIssuesCount: data.open_issues_count,
    language: data.language,
    defaultBranch: data.default_branch || 'main',
    htmlUrl: data.html_url,
    topics: data.topics || [],
  };
}

export async function fetchRepoTree(owner, repo, branch = 'main', token) {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, {
      headers: getHeaders(token),
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!data.tree || !Array.isArray(data.tree)) return [];

    // Filter to code and config files, exclude dist, node_modules, minified files, lockfiles, etc.
    const ignoredPatterns = [
      /node_modules\//i,
      /\.git\//i,
      /dist\//i,
      /build\//i,
      /coverage\//i,
      /\.lock$/i,
      /-lock\.json$/i,
      /\.(png|jpe?g|gif|svg|ico|webp|woff2?|ttf|eot|mp4|zip|tar|gz)$/i,
    ];

    const sourceFiles = data.tree
      .filter(item => item.type === 'blob')
      .filter(item => !ignoredPatterns.some(pattern => pattern.test(item.path)))
      .slice(0, 100)
      .map(item => ({ path: item.path, size: item.size }));

    return sourceFiles;
  } catch (err) {
    console.warn('Failed to fetch file tree:', err);
    return [];
  }
}

export async function fetchRepoIssues(owner, repo, token) {
  // Fetch up to 40 open issues
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=40&sort=updated&direction=desc`,
    { headers: getHeaders(token) }
  );

  if (!res.ok) {
    if (res.status === 403) {
      throw new Error(`GitHub rate limit hit. Please provide a GitHub Token in settings.`);
    }
    throw new Error(`Failed to fetch issues (HTTP ${res.status})`);
  }

  const issues = await res.json();
  if (!Array.isArray(issues)) return [];

  // Filter out Pull Requests (GitHub issues API includes PRs with a 'pull_request' key)
  const realIssues = issues
    .filter(item => !item.pull_request)
    .map(item => ({
      number: item.number,
      title: item.title,
      html_url: item.html_url,
      body: item.body || '',
      labels: (item.labels || []).map(l => ({ name: l.name, color: l.color })),
      comments: item.comments,
      createdAt: item.created_at,
      user: item.user?.login,
    }));

  return realIssues;
}
