# Setup Guide

## Quick Start

1. **Install dependencies**:

   ```bash
   bun install
   ```

2. **Run interactive setup**:

   ```bash
   bun run setup
   ```

3. **Start development**:

   ```bash
   bun run dev
   ```

The setup script will guide you through:
* Site configuration (title, author, description)
* Social links (GitHub, email, etc.)
* Comment system setup (optional)
* Content management (keep samples or start fresh)

## Manual Configuration

If you prefer manual setup, copy the environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```bash
# Site Information
SITE_TITLE="Your Novel Site"
SITE_AUTHOR="Your Name"
SITE_URL="https://your-domain.com"

# Social Links
GITHUB_URL="https://github.com/yourusername"
EMAIL_ADDRESS="your@email.com"

# Comments (optional)
GISCUS_REPO="yourusername/your-repo"
GISCUS_REPO_ID="your-repo-id"
```

## Adding Content

### Novels

Create files in `src/content/novels/`:

```yaml
---
title: "Your Novel Title"
description: "Brief description"
author: "your-author-slug"
status: "ongoing"
startDate: 2024-01-01
---
```

### Chapters

Create files in `src/content/chapters/` using the naming pattern `novel-slug-v1-c1.md`:

```yaml
---
title: "Chapter 1"
novel: "your-novel-slug"
volume: 1
chapter: 1
publishDate: 2024-01-01
---
```

### Authors

Create files in `src/content/authors/`:

```yaml
---
name: "Your Name"
bio: "Your bio"
avatar: "/path/to/avatar.jpg"
---
```

## Comments Setup

1. Enable GitHub Discussions on your repository
2. Install the [Giscus app](https://github.com/apps/giscus)
3. Get configuration from [giscus.app](https://giscus.app)
4. Add values to your `.env.local`

## Deployment

The template works with any static hosting:

* **Vercel**: Connect your GitHub repo
* **Netlify**: Deploy from Git
* **GitHub Pages**: Use GitHub Actions

Build command: `bun run build`
Output directory: `dist`
