# Comments

Chapter pages can load [Giscus](https://giscus.app) (GitHub Discussions).

1. Enable Discussions on the repository
2. Install the [Giscus app](https://github.com/apps/giscus)
3. Fill the form at [giscus.app](https://giscus.app)
4. Copy values into `.env.local`

```bash
GISCUS_ENABLED=true
GISCUS_REPO="yourusername/your-repo"
GISCUS_REPO_ID="R_kgDOH123456"
GISCUS_CATEGORY="General"
GISCUS_CATEGORY_ID="DIC_kwDOH123456"
```

Set `GISCUS_ENABLED=false` (or omit the Giscus ids) to hide the widget. Theme and mapping defaults live in `.env.example`.
