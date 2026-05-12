import { formatDate } from './utils.js';

const numberFormatter = new Intl.NumberFormat('en-US');

const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Rust: '#dea584',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Shell: '#89e051',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
  Dart: '#00B4AB',
  Scala: '#c22d40',
  Vue: '#41b883',
  Dockerfile: '#384d54'
};

export function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatNumber(value) {
  return numberFormatter.format(Number.isFinite(value) ? value : 0);
}

export function getLanguageColor(language) {
  return LANGUAGE_COLORS[language] || '#8b949e';
}

function safeUrl(value) {
  if (typeof value !== 'string') {
    return '#';
  }

  return /^https:\/\//.test(value) ? value : '#';
}

function safeGitHubRepoUrl(value) {
  if (typeof value !== 'string') {
    return '#';
  }

  return /^https:\/\/github\.com\//.test(value) ? value : '#';
}

function formatRepoUpdatedAt(updatedAt) {
  if (!updatedAt) {
    return 'Unknown';
  }

  const diffMs = Date.now() - new Date(updatedAt).getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays <= 0) {
    return 'Today';
  }

  if (diffDays === 1) {
    return '1 day ago';
  }

  if (diffDays < 30) {
    return `${diffDays} days ago`;
  }

  return formatDate(updatedAt);
}

function buildLanguageDistribution(repositories) {
  const languageCounts = new Map();

  repositories.forEach((repository) => {
    const language = repository.language || 'Other';
    languageCounts.set(language, (languageCounts.get(language) || 0) + 1);
  });

  const total = Array.from(languageCounts.values()).reduce((sum, count) => sum + count, 0);

  return Array.from(languageCounts.entries())
    .map(([language, count]) => ({
      language,
      count,
      color: getLanguageColor(language),
      percentage: total > 0 ? (count / total) * 100 : 0
    }))
    .sort((left, right) => right.count - left.count);
}

function buildActivityTimeline(repositories) {
  const activity = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 29);

  for (let index = 0; index < 30; index += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    activity.push({
      date: day.toISOString(),
      label: day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      count: 0
    });
  }

  repositories.forEach((repository) => {
    if (!repository.updated_at) {
      return;
    }

    const updatedAt = new Date(repository.updated_at);
    updatedAt.setHours(0, 0, 0, 0);

    activity.forEach((day) => {
      const activityDate = new Date(day.date);
      if (updatedAt.getTime() === activityDate.getTime()) {
        day.count += 1;
      }
    });
  });

  return activity;
}

function buildTreemapNodes(repositories) {
  return repositories
    .filter((repository) => repository.size > 0)
    .sort((left, right) => right.size - left.size)
    .slice(0, 10)
    .map((repository) => ({
      name: repository.name,
      size: repository.size,
      language: repository.language || 'Other',
      url: safeGitHubRepoUrl(repository.html_url)
    }));
}

export function prepareOrganizationData(orgData) {
  const organization = (orgData && orgData.organization) || {};
  const repositories = Array.isArray(orgData && orgData.repositories)
    ? [...orgData.repositories]
    : [];

  const sortedByStars = repositories.sort((left, right) => right.stargazers_count - left.stargazers_count);
  const languageDistribution = buildLanguageDistribution(sortedByStars);
  const mostCommonLanguage = languageDistribution[0] ? languageDistribution[0].language : 'N/A';

  const summary = sortedByStars.reduce((accumulator, repository) => ({
    stars: accumulator.stars + (repository.stargazers_count || 0),
    forks: accumulator.forks + (repository.forks_count || 0),
    openIssues: accumulator.openIssues + (repository.open_issues_count || 0)
  }), { stars: 0, forks: 0, openIssues: 0 });

  return {
    organization: {
      ...organization,
      displayName: organization.name || organization.login || 'Organization'
    },
    topRepositories: sortedByStars.slice(0, 8),
    languageDistribution,
    starsDistribution: sortedByStars.slice(0, 10).map((repository) => ({
      name: repository.name,
      stars: repository.stargazers_count || 0,
      language: repository.language || 'Other'
    })),
    activityTimeline: buildActivityTimeline(sortedByStars),
    treemapNodes: buildTreemapNodes(sortedByStars),
    summary: {
      ...summary,
      mostCommonLanguage
    }
  };
}

export function renderOrganizationStatsLoading(containerId, orgName) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="org-page-message">
      <div class="loading-spinner"></div>
      <div class="org-page-message__title">Loading ${escapeHtml(orgName)} organization stats…</div>
      <div class="org-page-message__detail">Fetching GitHub organization profile and repository metrics.</div>
    </div>
  `;
}

export function renderOrganizationStatsError(containerId, orgName, message) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="org-page-message org-page-message--error">
      <div class="error-icon">⚠️</div>
      <div class="org-page-message__title">Unable to load ${escapeHtml(orgName)} organization stats</div>
      <div class="org-page-message__detail">${escapeHtml(message)}</div>
    </div>
  `;
}

export function renderOrganizationStats(containerId, orgData) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  const preparedData = prepareOrganizationData(orgData);
  const { organization, summary, topRepositories } = preparedData;

  const summaryMarkup = [
    { label: 'Total stars', value: formatNumber(summary.stars) },
    { label: 'Total forks', value: formatNumber(summary.forks) },
    { label: 'Open issues', value: formatNumber(summary.openIssues) },
    { label: 'Top language', value: escapeHtml(summary.mostCommonLanguage) }
  ].map((stat) => `
    <div class="org-summary-card">
      <span class="org-summary-card__label">${stat.label}</span>
      <span class="org-summary-card__value">${stat.value}</span>
    </div>
  `).join('');

  const repositoriesMarkup = topRepositories.map((repository) => {
    const language = repository.language || 'Other';

    return `
      <article class="org-repo-card">
        <div class="org-repo-card__header">
          <a class="org-repo-card__name" href="${safeGitHubRepoUrl(repository.html_url)}" target="_blank" rel="noreferrer">
            ${escapeHtml(repository.name)}
          </a>
          <span class="org-repo-card__timestamp">Updated ${escapeHtml(formatRepoUpdatedAt(repository.updated_at))}</span>
        </div>
        <p class="org-repo-card__description">${escapeHtml(repository.description || 'No description available')}</p>
        <div class="org-repo-card__meta">
          <span class="org-repo-card__language">
            <span class="org-language-dot" style="background:${getLanguageColor(language)}"></span>
            ${escapeHtml(language)}
          </span>
          <span>★ ${formatNumber(repository.stargazers_count || 0)}</span>
          <span>⑂ ${formatNumber(repository.forks_count || 0)}</span>
          <span>⚠ ${formatNumber(repository.open_issues_count || 0)}</span>
        </div>
      </article>
    `;
  }).join('');

  container.innerHTML = `
    <section class="org-overview-card">
      <div class="org-overview-card__header">
        <img class="org-overview-card__avatar" src="${safeUrl(organization.avatarUrl)}" alt="${escapeHtml(organization.displayName)} avatar" />
        <div class="org-overview-card__body">
          <div class="org-overview-card__eyebrow">GitHub Organization</div>
          <h2 class="org-overview-card__title">${escapeHtml(organization.displayName)}</h2>
          <p class="org-overview-card__description">${escapeHtml(organization.description || 'Public GitHub organization dashboard')}</p>
          <div class="org-overview-card__stats">
            <span class="org-pill">${formatNumber(organization.publicRepos || 0)} public repos</span>
            <span class="org-pill">${formatNumber(organization.publicMembers || 0)} public members</span>
            <span class="org-pill">${escapeHtml(organization.login || '')}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="org-summary-grid">
      ${summaryMarkup}
    </section>

    <section class="org-section">
      <div class="org-section__header">
        <h3 class="org-section__title">Top repositories by stars</h3>
        <span class="org-section__subtitle">TV-friendly snapshot of the most visible public projects.</span>
      </div>
      <div class="org-repo-grid">
        ${repositoriesMarkup || '<div class="org-empty-state">No public repositories available.</div>'}
      </div>
    </section>
  `;
}
