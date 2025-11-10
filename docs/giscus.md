# Comments Setup

## Quick Setup

1. **Enable GitHub Discussions** on your repository
2. **Install Giscus app**: Visit [github.com/apps/giscus](https://github.com/apps/giscus)
3. **Get configuration**: Go to [giscus.app](https://giscus.app) and enter your repo
4. **Add to environment**: Copy values to your `.env.local`

```bash
GISCUS_REPO="yourusername/your-repo"
GISCUS_REPO_ID="R_kgDOH123456"
GISCUS_CATEGORY="General"
GISCUS_CATEGORY_ID="DIC_kwDOH123456"
```

## Configuration Options

### Theme Options
* `light` - Light theme
* `dark` - Dark theme  
* `preferred_color_scheme` - Auto (follows system)

### Mapping Options
* `pathname` - Uses page path (recommended)
* `url` - Uses full URL
* `title` - Uses page title

## Disabling Comments

### For specific chapters

```yaml
---
title: "Chapter 1"
enableComments: false
---
```

### For entire novels

```yaml
---
title: "My Novel"
enableComments: false
---
```

## Troubleshooting

**Comments don't appear:**

1. Check repository has Discussions enabled
2. Verify Giscus app is installed
3. Confirm configuration values are correct
4. Ensure repository is public

**Wrong category:**

1. Check category name matches exactly
2. Verify category exists in your repository
