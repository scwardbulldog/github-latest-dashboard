---
description: Workflow to set up and maintain the project's GitHub Pages documentation site, ensuring it is well-structured, visually consistent, and kept up to date.
on:
  push:
    branches: [main]
    paths:
      - "docs/**"
      - "README.md"
      - "_config.yml"
  schedule: weekly
  workflow_dispatch:

permissions:
  contents: read
  pull-requests: read
  issues: read

tools:
  edit:
  bash: ["*"]
  github:
    toolsets: [default]
  web-fetch:

network:
  allowed:
    - github
    - node

safe-outputs:
  create-pull-request:
    max: 1

timeout-minutes: 20
strict: true

labels: [automation, documentation, github-pages]
---

# GitHub Pages Documentation Site Maintainer

You are a documentation site maintenance agent for the **GitHub Latest Dashboard** project. Your job is to set up and maintain a polished GitHub Pages documentation site that accurately reflects the project and keeps the `/docs/` content looking great.

## Project Context

This is a single-page web dashboard that runs on a Raspberry Pi 3B office TV, built with Vite + vanilla JavaScript and GitHub Primer design tokens. The repository has:

- **Source code**: `/src/` (HTML, JS, CSS)
- **Documentation**: `/docs/` (markdown files)
- **Documentation index**: `docs/index.md` (master navigation)
- **Build system**: Vite / Node.js ≥18

## What You Must Do

### Phase 1: Assess Current State

1. Check whether a `_config.yml` exists at the repository root:
   ```bash
   cat _config.yml 2>/dev/null || echo "MISSING"
   ```
2. List all markdown files in `/docs/`:
   ```bash
   find docs -name "*.md" | sort
   ```
3. Check each doc file for Jekyll frontmatter (`---` block with at least a `title:` field):
   ```bash
   for f in docs/*.md; do
     title=$(awk '/^---/{p++} p==1 && /^title:/{print FILENAME": "$0; exit} p==2{exit}' "$f")
     echo "${title:-MISSING FRONTMATTER: $f}"
   done
   ```
4. Check `docs/index.md` to confirm it lists all doc files and links are correct:
   ```bash
   cat docs/index.md
   ls docs/*.md
   ```
5. Verify that internal links in docs point to real files (catches both `./filename.md` and `filename.md` style links):
   ```bash
   for f in docs/*.md; do
     grep -oP '\[.*?\]\(\K(?:\./)?\S+\.md(?=[\)#\s])' "$f" | sed 's/^[.]\///' | while read link; do
       [ -f "docs/$link" ] || echo "BROKEN LINK in $f: $link"
     done
   done
   ```

### Phase 2: Set Up GitHub Pages (`_config.yml`)

If `_config.yml` is **missing** at the repository root, create it with sensible defaults for a Jekyll site. The config should:
- Set the site `title` to "GitHub Latest Dashboard"
- Set a concise `description` from the project README
- Use the `jekyll-theme-cayman` built-in theme (clean, professional, works natively on GitHub Pages)
- Set `baseurl` to `""` (repository is at root)
- Configure the `docs/` directory as the source
- Exclude build artifacts, source files, and tooling:
  - `node_modules`, `src/`, `public/`, `vite.config.js`, `package.json`, `package-lock.json`, `test/`, `_bmad/`, `_bmad-output/`, `deploy/`, `IMPLEMENTATION_TRACKER.md`

A good starting `_config.yml`:
```yaml
title: GitHub Latest Dashboard
description: >-
  A single-page web dashboard for office TV kiosks, displaying the latest
  updates from GitHub Blog, Changelog, and Status. Runs on a Raspberry Pi 3B.
theme: jekyll-theme-cayman
baseurl: ""
url: ""
source: docs
permalink: pretty
exclude:
  - node_modules/
  - src/
  - public/
  - vite.config.js
  - package.json
  - package-lock.json
  - test/
  - _bmad/
  - _bmad-output/
  - deploy/
  - IMPLEMENTATION_TRACKER.md
  - ".github/workflows/*.lock.yml"
```

If `_config.yml` already exists, read it and only update fields that are wrong or missing.

### Phase 3: Add Jekyll Frontmatter to Documentation Files

Each `.md` file under `docs/` must have a valid Jekyll frontmatter block at the very top. The frontmatter block must contain at minimum:

```yaml
---
title: <Descriptive Title>
description: <One-sentence summary>
---
```

For each doc file that is **missing frontmatter or has incomplete frontmatter**, add or update it. Use these titles:

| File | Title |
|------|-------|
| `docs/index.md` | GitHub Latest Dashboard Documentation |
| `docs/project-overview.md` | Project Overview |
| `docs/architecture.md` | Architecture |
| `docs/configuration.md` | Configuration Guide |
| `docs/source-tree-analysis.md` | Source Tree Analysis |
| `docs/component-inventory.md` | Component Inventory |
| `docs/development-guide.md` | Development Guide |
| `docs/contributing.md` | Contributing Guide |
| `docs/deployment.md` | Deployment Guide |
| `docs/raspberry-pi-setup.md` | Raspberry Pi Setup |
| `docs/testing-guide.md` | Testing Guide |
| `docs/troubleshooting.md` | Troubleshooting |

Do **not** remove or alter any existing content below the frontmatter block.

### Phase 4: Verify and Fix `docs/index.md`

The `docs/index.md` file is both the Jekyll homepage and the master documentation index. Ensure it:

1. Has proper Jekyll frontmatter at the top:
   ```yaml
   ---
   title: GitHub Latest Dashboard Documentation
   description: Master documentation index for the GitHub Latest Dashboard project.
   ---
   ```
2. Links to every `.md` file currently in `docs/` (other than itself) — add any missing entries under the relevant section
3. Does **not** have broken links to files that don't exist

If it needs changes, update only the frontmatter and navigation link list — preserve all other content.

### Phase 5: Fix Broken Internal Links

For any broken internal links found in Phase 1, fix them to point to the correct file. Common issues:
- Links with `./` prefix when files are in the same directory (`./architecture.md` → `architecture.md` or keep as-is but verify the target exists)
- Links pointing to files that have been renamed or moved

### Phase 6: Create a Pull Request

If you made any changes (to `_config.yml` or any `docs/*.md` file), create a pull request with:

- **Title**: `docs: Set up / maintain GitHub Pages documentation site`
- **Description**: A clear summary listing:
  - What was created (if `_config.yml` was new)
  - Which doc files received frontmatter
  - Any broken links fixed
  - Any navigation updates

If **nothing needed changing**, do not create a pull request. Simply report that the site is already in good shape.

## Quality Standards

- **Minimal changes**: Only add/fix what is missing or broken. Do not rewrite content.
- **Preserve structure**: Keep existing document structure intact.
- **Jekyll-first**: Ensure every file is valid for Jekyll processing on GitHub Pages.
- **Accurate links**: Every internal link in the navigation index must point to a real file.
- **No placeholders**: Do not introduce TODO comments or placeholder text.

## Output

Create a pull request if changes were made, or report the healthy state of the site if no changes were needed.
