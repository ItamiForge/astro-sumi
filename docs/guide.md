# Complete Guide

## Architecture Overview

### Content Management
- **Content Collections**: Astro's type-safe content system for novels, chapters, and authors
- **Hierarchical Structure**: Novels → Volumes → Chapters organization
- **Draft System**: Content can be marked as draft and excluded from production builds
- **Validation**: Runtime content validation with error handling and fallbacks

### Styling & UI
- **Tailwind CSS 4.x**: Latest version with Vite plugin for better performance
- **shadcn/ui Components**: Pre-built accessible React components
- **CSS Custom Properties**: Theme system supporting light/dark modes
- **Typography**: Optimized for long-form reading with proper spacing and contrast

### Performance Features
- **Static Generation**: Pre-built pages for optimal loading speed
- **Image Optimization**: Astro's built-in image processing
- **Code Splitting**: Automatic JavaScript bundling and splitting
- **CSS Optimization**: Purged and minified stylesheets

## Content Structure

### Adding Novels

Create files in `src/content/novels/`:

```yaml
---
title: "Your Novel Title"
description: "Brief description"
genre: ["fantasy", "adventure"]
status: "ongoing"
author: "your-author-slug"
startDate: 2024-01-01
lastUpdated: 2024-01-15
wordCount: 25000
tags: ["magic", "quest"]
mature: false
summary: "Extended summary of your novel"
draft: false
---
```

### Adding Chapters

Create files in `src/content/chapters/` using pattern `novel-slug-v1-c1.md`:

```yaml
---
title: "Chapter Title"
novel: "novel-slug"
volume: 1
volumeTitle: "volume-slug"
chapter: 1
publishDate: 2024-01-01
wordCount: 5000
summary: "Brief chapter summary"
draft: false
---
```

### Adding Authors

Create files in `src/content/authors/`:

```yaml
---
name: "Your Name"
penName: "Your Pen Name"
pronouns: "they/them"
avatar: "/path/to/avatar.jpg"
bio: "Your biography"
genres: ["fantasy", "sci-fi"]
website: "https://yoursite.com"
github: "https://github.com/yourusername"
email: "your@email.com"
---
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Site Information
SITE_TITLE="Your Novel Site"
SITE_DESCRIPTION="Your site description"
SITE_AUTHOR="Your Name"
SITE_URL="https://your-domain.com"

# Social Links
GITHUB_URL="https://github.com/yourusername"
EMAIL_ADDRESS="your@email.com"

# Comments (Giscus) - Optional
GISCUS_REPO="yourusername/your-repo"
GISCUS_REPO_ID="your-repo-id"
GISCUS_CATEGORY="General"
GISCUS_CATEGORY_ID="your-category-id"
```

### Site Configuration

Edit `src/consts.ts` for advanced customization:

```typescript
export const SITE: Site = {
  title: siteConfig.title,
  description: siteConfig.description,
  href: siteConfig.url,
  author: siteConfig.author,
  locale: siteConfig.locale,
  featuredNovelCount: siteConfig.featuredNovelCount,
  novelsPerPage: siteConfig.novelsPerPage,
}
```

## Customization

### Styling

Colors are defined in `src/styles/global.css` using OKLCH format:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  /* ... */
}
```

### Components

- **Navigation**: Modify `src/components/Header.astro`
- **Footer**: Edit `src/components/Footer.astro`
- **Layouts**: Customize `src/layouts/Layout.astro`

### Favicons

Replace files in `public/` directory and update references in `src/components/Favicons.astro`.

## Deployment

### Build Process

```bash
bun run build
```

Output directory: `dist/`

### Hosting Options

- **Vercel**: Connect GitHub repository
- **Netlify**: Deploy from Git
- **GitHub Pages**: Use GitHub Actions
- **Cloudflare Pages**: Connect repository

### Environment Variables for Production

Set these in your hosting platform:

- `SITE_URL`: Your production domain
- `GISCUS_*`: Comment system configuration
- `GITHUB_URL`: Your GitHub profile
- `EMAIL_ADDRESS`: Contact email

## Troubleshooting

### Common Issues

**Content not displaying:**
```bash
# Check content files exist
ls src/content/novels/
ls src/content/chapters/
ls src/content/authors/

# Restart development server
bun run dev
```

**Environment variables not loading:**
```bash
# Verify .env.local exists and format is correct
cat .env.local

# Restart development server after changes
bun run dev
```

**Build errors:**
```bash
# Run type checking
astro check

# Check for TypeScript errors
bun run build
```

**Comments not working:**
- Verify repository has Discussions enabled
- Check Giscus app is installed
- Confirm configuration values are correct
- Ensure repository is public

### Performance Issues

**Slow build times:**
```bash
# Clear Astro cache
rm -rf .astro

# Update dependencies
bun update
```

**Large bundle size:**
```bash
# Analyze bundle
bun run build

# Check for unused dependencies
bun run security:audit
```

## Advanced Features

### Testing

Run tests with:
```bash
bun run test          # Watch mode
bun run test:run      # Single run
bun run test:coverage # With coverage
```

### Security

Audit dependencies:
```bash
bun run security:audit    # Check vulnerabilities
bun run security:fix      # Auto-fix issues
```

### Code Quality

Format and lint:
```bash
bun run prettier         # Format code
bun run lint:css         # Lint CSS
bun run lint:css:fix     # Fix CSS issues
```