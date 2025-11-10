# Astro Sumi

A clean, minimal template for novel and book writing websites.

## Features

* **Novel Organization**: Hierarchical structure with novels, volumes, and chapters
* **Reading Interface**: Clean, distraction-free experience optimized for long-form content
* **Multi-Author Support**: Author profiles with pen names, genres, and social links
* **Content Management**: Draft mode, publication scheduling, and word count tracking
* **Responsive Design**: Mobile-optimized reading experience
* **SEO Optimized**: Built-in metadata management and RSS feed generation

## Quick Start

1. **Use this template** on GitHub or clone:

   ```bash
   git clone https://github.com/your-username/astro-sumi.git my-novel-site
   cd my-novel-site
   ```

2. **Install dependencies**:

   ```bash
   bun install
   ```

3. **Choose your setup**:

   ```bash
   # Interactive setup (recommended)
   bun run setup

   # Or manual configuration
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Start development**:

   ```bash
   bun run dev
   ```

## Commands

### Development

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run preview` | Preview built project |
| `bun run setup` | Interactive configuration |

### Code Quality

| Command | Description |
|---------|-------------|
| `bun run test` | Run tests |
| `bun run test:run` | Run tests once |
| `bun run prettier` | Format code |
| `bun run lint:css` | Lint CSS |

### Security

| Command | Description |
|---------|-------------|
| `bun run security:audit` | Check vulnerabilities |
| `bun run security:fix` | Fix vulnerabilities |

### Package Management

| Command | Description |
|---------|-------------|
| `bun install` | Install dependencies |
| `bun add <package>` | Add dependency |
| `bun remove <package>` | Remove dependency |
| `bun update` | Update dependencies |

## Documentation

* **[Setup Guide](docs/setup.md)** - Getting started and configuration
* **[Complete Guide](docs/guide.md)** - Architecture, customization, and advanced features
* **[Comments Setup](docs/giscus.md)** - GitHub Discussions integration

## Tech Stack

* **[Astro 5.x](https://astro.build)** - Static site generator
* **[Bun](https://bun.sh)** - JavaScript runtime and package manager
* **[Tailwind CSS 4.x](https://tailwindcss.com)** - Utility-first CSS framework
* **[shadcn/ui](https://ui.shadcn.com)** - Accessible React components
* **[TypeScript](https://typescriptlang.org)** - Type-safe JavaScript
* **[Vitest](https://vitest.dev)** - Testing framework

## License

MIT License - see [LICENSE](LICENSE) file.

## Attribution

Based on [astro-erudite](https://github.com/jktrn/astro-erudite) by [jktrn](https://github.com/jktrn).

Built with [Astro](https://astro.build) and [shadcn/ui](https://ui.shadcn.com).
