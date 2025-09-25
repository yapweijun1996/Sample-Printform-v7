# Repository Guidelines

## Project Structure & Module Organization
The repository hosts a static print-form demo. Root-level `index001.html` through `index007.html` and `example.html` showcase different layouts; treat them as source files rather than generated artifacts. Shared assets live under `img/`, while client-side behavior is defined in `js/printform.js` and `js/printform - Copy.js` (keep the copy only for regression comparisons or remove once redundant). Configuration for auxiliary tooling sits in `mcp.config.json`.

## Build, Test, and Development Commands
Use a lightweight static server to preview pages: `python -m http.server 8000` from the repo root serves everything at `http://localhost:8000/`. To lint JavaScript quickly, run `npx eslint js/printform.js` after installing ESLint locally; prefer `npm install`ing any dev dependencies in a separate virtual environment. Launch Chrome DevTools MCP via `npx chrome-devtools-mcp@latest` if you rely on the provided MCP config.

## Coding Style & Naming Conventions
JavaScript currently follows vanilla ES5 syntax with tab indentation and double-quoted strings; continue that convention when touching the existing files, and document any modernization in the PR. Keep global flags in `printform.js` camelCase (e.g., `repeatFooterLogo`), and mirror dataset attribute names in kebab-case for HTML. Image assets should use lowercase hyphenated names and stay under `img/`.

## Testing Guidelines
There is no automated test harness yet; prioritize manual validation in modern Chromium builds and print preview. When adding scripts, couple them with focused smoke tests embedded in `example.html` or a new `indexXXX.html` variant, and describe expected outcomes. If you introduce automated tooling, document invocation and minimum coverage expectations here.

## Commit & Pull Request Guidelines
The project does not currently include Git history, so adopt Conventional Commit prefixes (`feat:`, `fix:`, `docs:`) when you initialize or contribute. Scope commits tightly around single features or fixes, and ensure PR descriptions call out affected HTML forms, include before/after screenshots for layout shifts, and link to tracking issues when available. Request review from a maintainer familiar with printing flows before merging.

## Agent Notes
Agents should verify that HTML changes keep printable widths under 750px and that `getPrintformConfig` defaults remain synchronized between docs and code. Flag any new global variables so they can be centralized in the configuration block.

- When editing `index.html` (or variants), keep the inline comment block above the `.printform` container aligned with every supported `data-*` attribute (`data-repeat-docinfo002` through `data-repeat-docinfo005`, spacer flags, debug toggle, etc.) so engineers can audit configuration without jumping to the script.
- Avoid enabling both `data-insert-dummy-row-item-while-format-table` and `data-insert-dummy-row-while-format-table` unless the double fill is intentional; the formatter stacks both fillers.
- If a custom dummy-row template is provided, confirm its rendered height matches `data-height-of-dummy-row-item`; otherwise pagination math drifts.
