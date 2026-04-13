---
description: Weekly workflow to maintain AGENTS.md by reviewing merged PRs and updated source files
on:
  schedule: weekly
  skip-if-match: 'is:pr is:open in:title "Update AGENTS.md"'
permissions:
  contents: read
  pull-requests: read
  issues: read
tools:
  github:
    toolsets: [default]
  cache-memory: true
safe-outputs:
  create-pull-request:
    max: 1
  noop:
---

# Maintain AGENTS.md

You are an AI agent responsible for keeping the `AGENTS.md` file accurate and up-to-date. This file documents the repository's agent-related conventions, coding patterns, architecture decisions, and any special instructions for AI assistants working in this codebase.

## Your Task

1. **Review merged PRs since last run**: Use the GitHub tools to list pull requests merged since the last workflow run. Focus on PRs that modify:
   - Source code in `/src/` directory
   - Configuration files (`vite.config.js`, `package.json`)
   - Documentation files in `/docs/`
   - Agent-related files (`.github/` directory)

2. **Analyze source file changes**: Review the current state of the repository to understand:
   - JavaScript modules and their responsibilities
   - CSS files and design patterns
   - Build system and development workflows
   - Testing patterns and validation scripts

3. **Check cache-memory**: Read `/tmp/gh-aw/cache-memory/last-run.json` to find the timestamp of the last workflow run. If it doesn't exist, review the last 7 days of merged PRs.

4. **Determine if AGENTS.md needs updating**: Based on your analysis, decide if the AGENTS.md file needs to be created or updated. Consider:
   - New coding patterns or conventions introduced
   - Changed file structures or architecture
   - New or modified development workflows
   - Updated dependencies or tooling
   - New AI agent instructions or context

5. **Create or update AGENTS.md**: If changes are needed, create a pull request with an updated AGENTS.md file that includes:
   - Project overview and purpose
   - Technology stack and constraints
   - File structure and editing rules
   - Coding patterns and conventions
   - Build and test commands
   - Design system usage (GitHub Primer tokens)
   - Browser compatibility notes (Chromium 84)
   - Any special instructions for AI agents

6. **Update cache-memory**: Write the current timestamp to `/tmp/gh-aw/cache-memory/last-run.json` using filesystem-safe format `YYYY-MM-DD-HH-MM-SS`.

## Guidelines

- **Be thorough**: Review all relevant PRs and source files to capture the full picture
- **Be concise**: AGENTS.md should be practical and actionable, not exhaustive
- **Match existing style**: If AGENTS.md exists, preserve its structure while updating content
- **Focus on AI relevance**: Include information that helps AI agents work effectively in this codebase
- **Use the existing copilot-instructions**: Reference `_bmad-output/project-context.md` and `.github/copilot-instructions.md` if they exist for context

## Source Files to Review

Key files to analyze for AGENTS.md content:
- `src/js/*.js` - JavaScript modules
- `src/css/*.css` - Stylesheets
- `src/index.html` - HTML structure
- `vite.config.js` - Build configuration
- `package.json` - Dependencies and scripts
- `docs/*.md` - Documentation files

## Output Format

When creating the AGENTS.md file, follow this structure:

```markdown
# AGENTS.md

> Auto-generated documentation for AI agents working in this repository.
> Last updated: [date]

## Project Summary
[Brief description of the project]

## Technology Stack
[Languages, frameworks, build tools]

## Critical Rules
[Important rules that must be followed]

## File Structure
[Key directories and their purposes]

## Development Workflow
[Commands and processes]

## Coding Patterns
[Conventions and best practices]

## Additional Context
[Links to detailed documentation]
```

## Safe Outputs

- If you create or update AGENTS.md: Use the `create-pull-request` safe output with title "Update AGENTS.md" and include a summary of changes
- If AGENTS.md is already up-to-date: Use the `noop` safe output with a message explaining no changes were needed
