import { escapeHtml, formatNumber, getLanguageColor, prepareOrganizationData } from './org-stats.js';

const MIN_TREEMAP_LABEL_WIDTH = 150;
const MIN_TREEMAP_LABEL_HEIGHT = 70;
const TREEMAP_LABEL_PADDING_X = 20;
const TREEMAP_LABEL_PRIMARY_Y = 42;
const TREEMAP_LABEL_SECONDARY_Y = 74;

function buildDonutChart(languageDistribution) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const segments = languageDistribution.slice(0, 6).map((entry) => {
    const dash = (entry.percentage / 100) * circumference;
    const segment = `
      <circle
        class="org-donut-chart__segment"
        cx="70"
        cy="70"
        r="${radius}"
        fill="none"
        stroke="${entry.color}"
        stroke-width="18"
        stroke-dasharray="${dash} ${circumference - dash}"
        stroke-dashoffset="${-offset}"
      ></circle>
    `;
    offset += dash;
    return segment;
  }).join('');

  return `
    <svg class="org-donut-chart" viewBox="0 0 140 140" aria-hidden="true">
      <circle class="org-donut-chart__track" cx="70" cy="70" r="${radius}" fill="none" stroke="var(--color-border-default)" stroke-width="18"></circle>
      ${segments}
      <text x="70" y="64" text-anchor="middle" class="org-donut-chart__value">${formatNumber(languageDistribution.length)}</text>
      <text x="70" y="84" text-anchor="middle" class="org-donut-chart__label">languages</text>
    </svg>
  `;
}

function buildStarsBarChart(starsDistribution) {
  const maxStars = starsDistribution.reduce((max, repository) => Math.max(max, repository.stars), 0) || 1;

  return starsDistribution.map((repository) => `
    <div class="org-bar-row">
      <div class="org-bar-row__label">${escapeHtml(repository.name)}</div>
      <div class="org-bar-row__track">
        <div class="org-bar-row__fill" style="width:${(repository.stars / maxStars) * 100}%"></div>
      </div>
      <div class="org-bar-row__value">${formatNumber(repository.stars)}</div>
    </div>
  `).join('');
}

function buildActivityHeatmap(activityTimeline) {
  const maxCount = activityTimeline.reduce((max, day) => Math.max(max, day.count), 0);

  return activityTimeline.map((day) => {
    let level = 0;

    if (maxCount > 0) {
      const ratio = day.count / maxCount;
      if (ratio >= 0.75) {
        level = 4;
      } else if (ratio >= 0.5) {
        level = 3;
      } else if (ratio >= 0.25) {
        level = 2;
      } else if (ratio > 0) {
        level = 1;
      }
    }

    return `
      <div class="org-heatmap-cell org-heatmap-cell--level-${level}" aria-label="${escapeHtml(`${day.label}: ${day.count} updates`)}">
        <span class="org-heatmap-cell__value">${formatNumber(day.count)}</span>
        <span class="org-heatmap-cell__label">${escapeHtml(day.label)}</span>
      </div>
    `;
  }).join('');
}

function splitNodes(nodes) {
  if (nodes.length <= 1) {
    return [nodes, []];
  }

  const total = nodes.reduce((sum, node) => sum + node.size, 0);
  let runningTotal = 0;
  let index = 0;

  while (index < nodes.length && runningTotal < total / 2) {
    runningTotal += nodes[index].size;
    index += 1;
  }

  const safeIndex = Math.min(Math.max(index, 1), nodes.length - 1);
  return [nodes.slice(0, safeIndex), nodes.slice(safeIndex)];
}

function layoutTreemap(nodes, x, y, width, height, splitVertically = true) {
  if (nodes.length === 0) {
    return [];
  }

  if (nodes.length === 1) {
    return [{ ...nodes[0], x, y, width, height }];
  }

  const total = nodes.reduce((sum, node) => sum + node.size, 0);
  const [firstGroup, secondGroup] = splitNodes(nodes);
  const firstTotal = firstGroup.reduce((sum, node) => sum + node.size, 0);
  const ratio = total > 0 ? firstTotal / total : 0.5;

  if (splitVertically) {
    const firstWidth = width * ratio;
    return [
      ...layoutTreemap(firstGroup, x, y, firstWidth, height, !splitVertically),
      ...layoutTreemap(secondGroup, x + firstWidth, y, width - firstWidth, height, !splitVertically)
    ];
  }

  const firstHeight = height * ratio;
  return [
    ...layoutTreemap(firstGroup, x, y, width, firstHeight, !splitVertically),
    ...layoutTreemap(secondGroup, x, y + firstHeight, width, height - firstHeight, !splitVertically)
  ];
}

function buildTreemap(treemapNodes) {
  const laidOutNodes = layoutTreemap(treemapNodes, 0, 0, 1000, 420);

  return `
    <svg class="org-treemap" viewBox="0 0 1000 420" aria-hidden="true">
      ${laidOutNodes.map((node) => `
        <g>
          <a href="${node.url}" target="_blank" rel="noreferrer" aria-label="${escapeHtml(`${node.name} repository, ${node.size} KB`)}">
            <rect
              x="${node.x + 4}"
              y="${node.y + 4}"
              width="${Math.max(node.width - 8, 0)}"
              height="${Math.max(node.height - 8, 0)}"
              rx="12"
              fill="${getLanguageColor(node.language)}"
              fill-opacity="0.75"
            ></rect>
          </a>
          ${node.width > MIN_TREEMAP_LABEL_WIDTH && node.height > MIN_TREEMAP_LABEL_HEIGHT ? `
            <text x="${node.x + TREEMAP_LABEL_PADDING_X}" y="${node.y + TREEMAP_LABEL_PRIMARY_Y}" class="org-treemap__label">${escapeHtml(node.name)}</text>
            <text x="${node.x + TREEMAP_LABEL_PADDING_X}" y="${node.y + TREEMAP_LABEL_SECONDARY_Y}" class="org-treemap__meta">${formatNumber(node.size)} KB</text>
          ` : ''}
        </g>
      `).join('')}
    </svg>
  `;
}

export function renderOrganizationVisualizationsLoading(containerId, orgName) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="org-page-message">
      <div class="loading-spinner"></div>
      <div class="org-page-message__title">Loading ${escapeHtml(orgName)} analytics…</div>
      <div class="org-page-message__detail">Preparing language, activity, and repository-size visualizations.</div>
    </div>
  `;
}

export function renderOrganizationVisualizationsError(containerId, orgName, message) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="org-page-message org-page-message--error">
      <div class="error-icon">⚠️</div>
      <div class="org-page-message__title">Unable to load ${escapeHtml(orgName)} analytics</div>
      <div class="org-page-message__detail">${escapeHtml(message)}</div>
    </div>
  `;
}

export function renderOrganizationVisualizations(containerId, orgData) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  const preparedData = prepareOrganizationData(orgData);
  const languageLegend = preparedData.languageDistribution.slice(0, 6).map((entry) => `
    <li class="org-legend__item">
      <span class="org-language-dot" style="background:${entry.color}"></span>
      <span>${escapeHtml(entry.language)}</span>
      <span class="org-legend__value">${formatNumber(entry.count)}</span>
    </li>
  `).join('');

  container.innerHTML = `
    <section class="org-visual-grid">
      <article class="org-visual-card">
        <div class="org-section__header">
          <h3 class="org-section__title">Language distribution</h3>
          <span class="org-section__subtitle">Breakdown by primary repository language.</span>
        </div>
        <div class="org-donut-layout">
          ${buildDonutChart(preparedData.languageDistribution)}
          <ul class="org-legend">
            ${languageLegend || '<li class="org-empty-state">No language data available.</li>'}
          </ul>
        </div>
      </article>

      <article class="org-visual-card">
        <div class="org-section__header">
          <h3 class="org-section__title">Stars leaderboard</h3>
          <span class="org-section__subtitle">Top repositories by public star count.</span>
        </div>
        <div class="org-bar-chart">
          ${buildStarsBarChart(preparedData.starsDistribution)}
        </div>
      </article>

      <article class="org-visual-card org-visual-card--wide">
        <div class="org-section__header">
          <h3 class="org-section__title">30-day activity heatmap</h3>
          <span class="org-section__subtitle">Daily count of repos updated in the last month.</span>
        </div>
        <div class="org-heatmap">
          ${buildActivityHeatmap(preparedData.activityTimeline)}
        </div>
      </article>

      <article class="org-visual-card org-visual-card--wide">
        <div class="org-section__header">
          <h3 class="org-section__title">Repository size treemap</h3>
          <span class="org-section__subtitle">Relative size for the largest public repositories.</span>
        </div>
        ${buildTreemap(preparedData.treemapNodes)}
      </article>
    </section>
  `;
}
