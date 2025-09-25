# Repository Guidelines

## Project Structure & Module Organization
- Root-level `index001.html` – `index007.html` and `example.html` are the primary printable layouts; treat them as source.
- Shared assets live under `img/`; keep new images lowercase and hyphenated.
- Client behavior is implemented in `js/printform.js`; `js/printform - Copy.js` is a reference for regressions and should not diverge without intent.
- Configuration for external tooling resides in `mcp.config.json`; update it when adding MCP clients or new server ports.

## Build, Test, and Development Commands
- `python -m http.server 8000` from the repo root serves the static pages at `http://localhost:8000/` for manual review and print preview.
- `npx eslint js/printform.js` lints the primary script; install ESLint locally before first use.
- Launch Chrome DevTools MCP via `npx chrome-devtools-mcp@latest` to inspect print layout metrics referenced by the config.

## Coding Style & Naming Conventions
- JavaScript sticks to ES5 constructs, tab indentation, and double-quoted strings; keep globals camelCase (e.g., `repeatFooterLogo`).
- HTML data attributes should mirror script flags in kebab-case and remain documented in the inline comment above each `.printform` block.
- New assets belong under `img/`; avoid uppercase or spaces in filenames.

## Testing Guidelines
- Manual validation in Chromium print preview is the baseline; verify printable widths stay below 750px.
- When introducing formatting logic, add a focused smoke demo (new `indexXXX.html` variant or update to `example.html`) and describe expected results.
- Ensure dummy-row templates render at the declared `data-height-of-dummy-row-item` to keep pagination correct; double fillers should only be enabled intentionally.

## Commit & Pull Request Guidelines
- Use Conventional Commit prefixes (`feat:`, `fix:`, `docs:`) and scope each commit to a single change.
- PRs must list affected HTML forms, include before/after screenshots for layout shifts, and link tracking issues where available.
- Request review from a maintainer familiar with printing flows before merging.

## Agent-Specific Notes
- Keep `getPrintformConfig` defaults in sync with documentation and inline comments.
- Flag any new global variables so they can be centralized in the configuration block.
- Do not remove `js/printform - Copy.js` unless a maintainer confirms the regression comparison is obsolete.
