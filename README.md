# Sample Printform v7

A JavaScript-based print pagination engine that transforms HTML table layouts into properly paginated, print-ready documents with repeating headers, footers, and automatic page numbering.

## Overview

`printform.js` processes `.printform` containers, cloning and splitting content across fixed-size pages while repeating configurable sections (headers, doc info, row headers, footers, logos, page numbers). It also supports PTAC (Purchase Terms and Conditions) blocks that are automatically segmented and paginated.

## Quick Start

1. Serve the repo locally:
   ```bash
   python -m http.server 8000
   ```
2. Open `http://localhost:8000/` and browse any `indexXXX.html` layout.
3. Use Chromium print preview (Ctrl+P) to verify pagination.

## Project Structure

```
.
├── js/
│   └── printform.js          # Core pagination engine
├── img/
│   ├── letterhead_logo.jpg   # Header logo asset
│   └── footer_logo.jpg       # Footer logo asset
├── index.html                # Main sample layout
├── index001.html – index014.html  # Layout variants / smoke demos
├── example.html              # Minimal usage example
├── AGENTS.md                 # AI agent guidelines
└── DEVELOPER_BOOK.md         # Developer handbook
```

## How It Works

1. Add `class="printform"` to a container `<div>`.
2. Inside, define sections using these classes:
   - `.pheader` — page header (repeatable)
   - `.pdocinfo` / `.pdocinfo002`–`.pdocinfo005` — document info blocks
   - `.prowheader` — table column header row (repeatable)
   - `.prowitem` — data rows
   - `.ptac-rowitem` — PTAC term segments (auto-generated from `.ptac` tables)
   - `.pfooter` / `.pfooter002`–`.pfooter005` — footer blocks
   - `.pfooter_logo` — footer logo (repeatable)
   - `.pfooter_pagenum` — auto page numbering
3. Configure behavior via `data-*` attributes on the `.printform` element.
4. Include the script at the end of your page:
   ```html
   <script src="js/printform.js"></script>
   ```

See [example.html](example.html) for a minimal working example.

## Configuration

Set `data-*` attributes on the `.printform` container to customize behavior:

| Attribute | Default | Description |
|---|---|---|
| `data-papersize-width` | `750` | Page width in pixels |
| `data-papersize-height` | `1050` | Page height in pixels |
| `data-height-of-dummy-row-item` | `26` | Height (px) for auto-fill dummy rows |
| `data-repeat-header` | `y` | Repeat `.pheader` on every page |
| `data-repeat-docinfo` | `y` | Repeat `.pdocinfo` on every page |
| `data-repeat-rowheader` | `y` | Repeat `.prowheader` on every page |
| `data-repeat-footer-logo` | `y` | Repeat `.pfooter_logo` on every page |
| `data-repeat-footer-pagenum` | `y` | Auto page numbers on every page |
| `data-insert-dummy-row-item-while-format-table` | `y` | Fill remaining space with dummy rows |
| `data-insert-dummy-row-while-format-table` | `y` | Add a full-height dummy table |
| `data-debug` | `n` | Enable verbose console logging |

Boolean attributes accept `y/yes/true/1` or `n/no/false/0`.

## Development

- **Code style**: ES5 syntax, tab indentation, double-quoted strings
- **Lint**: `npx eslint js/printform.js`
- **Testing**: Manual Chromium print preview; confirm widths stay below 750px
- **Commits**: Follow Conventional Commits (`feat:`, `fix:`, `docs:`)

See [DEVELOPER_BOOK.md](DEVELOPER_BOOK.md) for the full developer handbook.
