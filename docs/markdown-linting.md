# Markdown Linting with rumdl

This project uses [rumdl](https://github.com/LoremLabs/rumdl) (Rust Markdown Linter) for maintaining consistent and clean markdown files across novels, chapters, documentation, and other content.

## Installation

rumdl is a Rust-based tool installed globally via Cargo:

```bash
cargo install rumdl
```

Or download from [releases](https://github.com/LoremLabs/rumdl/releases).

## Configuration

The project includes a `.rumdl.toml` configuration file optimized for novel writing:

* **No line length limits** - Narrative prose flows naturally without artificial breaks
* **HTML allowed** - Page anchors and divs for chapter navigation
* **Flexible headings** - Creative writing may have multiple H1s or similar section names
* **Stylistic emphasis** - Allows emphasis markers for creative elements
* **Consistent formatting** - Enforces asterisks for lists and emphasis

## Usage

### Check markdown files

```bash
bun lint:md
# or
bun lint  # checks both CSS and markdown
```

### Auto-fix markdown issues

```bash
bun format:md
# or
bun format  # formats everything: code, CSS, and markdown
```

### Granular commands

```bash
bun lint:css      # Check CSS only
bun lint:md       # Check markdown only
bun format:css    # Fix CSS only
bun format:md     # Fix markdown only
bun prettier      # Format TypeScript/Astro only
```

## Pre-commit Hooks

Markdown linting runs automatically before every commit via Husky hooks. This ensures all committed markdown is consistent and clean.

## CI/CD

GitHub Actions workflow (`.github/workflows/lint.yml`) runs markdown linting on every push and pull request, ensuring code quality across the team.

## Disabled Rules for Creative Writing

The following rules are disabled because they don't align with novel writing:

* `MD013` - Line length (novels need long paragraphs)
* `MD033` - Inline HTML (used for page breaks and anchors)
* `MD024` - Duplicate headings (chapters may have similar section names)
* `MD025` - Multiple H1s (novels and docs may have multiple top-level headings)
* `MD026` - Trailing punctuation in headings (creative titles may use punctuation)
* `MD036` - Emphasis instead of heading (used for stylistic elements)
* `MD041` - First line must be H1 (frontmatter comes first)

## Enabled Standards

* Unordered lists use asterisks (`*`)
* Headings use ATX style (`#`)
* Code blocks use backticks
* Horizontal rules use three dashes (`---`)
* Maximum 2 consecutive blank lines
* Consistent emphasis and strong emphasis markers

## VS Code Extension

The rumdl VS Code extension is installed automatically during setup, providing real-time linting feedback in your editor.
