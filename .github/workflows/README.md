# Comments System CI/CD Workflows

This directory contains automated workflows for the modular comments system.

## Workflows

### 1. Comments Health Check (`comments-health-check.yml`)

**Purpose:** Monitors the health and availability of the comments system.

**Triggers:**
- Every 6 hours (scheduled)
- Manual dispatch
- Changes to comments system files

**What it does:**
- Validates configuration files
- Checks provider API availability (Giscus)

- Runs TypeScript type checking
- Executes unit tests
- Checks bundle size impact
- Creates health check reports
- Notifies on failures via GitHub issues

**Requirements covered:** 7.1, 7.2, 7.3

### 2. Comments Moderation (`comments-moderation.yml`)

**Purpose:** Automated moderation for GitHub Discussions comments.

**Triggers:**
- New discussion comments
- Edited discussion comments
- New discussions
- Edited discussions

**What it does:**
- Detects spam keywords
- Checks comment length (warns if > 3000 chars, flags if > 5000)
- Detects excessive links (flags if > 5 links)
- Monitors new user activity (flags accounts < 7 days old)
- Rate limiting (flags if > 10 comments/hour)
- Locks discussions with spam
- Creates moderation issues for review
- Generates moderation summaries

**Requirements covered:** 6.1, 6.2, 6.3, 6.4, 6.5, 7.4

### 3. Deployment Verification (`deploy-verify.yml`)

**Purpose:** Verifies comments system functionality after deployment.

**Triggers:**
- Deployment status changes (success)
- Manual dispatch with deployment URL

**What it does:**
- Waits for deployment to be ready
- Runs E2E tests for comments loading
- Checks comments load time (< 5s threshold)
- Runs Lighthouse performance audit
- Analyzes bundle size impact
- Verifies CSP headers for Giscus domains
- Tests theme synchronization
- Generates verification reports
- Notifies on failures via GitHub issues

**Requirements covered:** 7.5, 10.4

## Usage

### Manual Triggers

#### Health Check
```bash
gh workflow run comments-health-check.yml
```

#### Deployment Verification
```bash
gh workflow run deploy-verify.yml -f deployment_url=https://your-site.com
```

### Viewing Results

All workflows upload artifacts with detailed reports:
- `health-check-report` - Health check results
- `deployment-verification-report` - Deployment verification results

Access artifacts from the Actions tab in GitHub.

### Notifications

Failed workflows automatically create GitHub issues with:
- Detailed error information
- Links to workflow runs
- Suggested next steps
- Appropriate labels for triage

## Configuration

### Secrets Required

No secrets are required for basic functionality. However, for enhanced features:

- `GITHUB_TOKEN` - Automatically provided by GitHub Actions
- Additional provider-specific tokens (if using private repositories)

### Customization

#### Spam Keywords
Edit the `spamKeywords` array in `comments-moderation.yml`:
```yaml
const spamKeywords = [
  'viagra', 'casino', 'lottery',
  # Add your keywords here
]
```

#### Rate Limits
Adjust thresholds in `comments-moderation.yml`:
```yaml
const maxLength = 5000        # Maximum comment length
const warnLength = 3000       # Warning threshold
const maxLinks = 5            # Maximum links per comment
const rateLimit = 10          # Comments per hour
```

#### Performance Thresholds
Modify in `deploy-verify.yml`:
```yaml
const threshold = 5000        # Load time threshold (ms)
```

## Monitoring

### Health Check Schedule

The health check runs every 6 hours. To change the schedule, edit the cron expression:

```yaml
schedule:
  - cron: '0 */6 * * *'  # Every 6 hours
```

### Moderation Alerts

Moderation issues are created with these labels:
- `moderation` - All moderation issues
- `spam` - Spam detected
- `review-needed` - Requires manual review
- `rate-limit` - Rate limit exceeded
- `automated` - Created by automation

Filter issues by these labels to triage moderation tasks.

## Best Practices

1. **Review moderation issues regularly** - Check for false positives
2. **Adjust thresholds based on your community** - Different sites have different needs
3. **Monitor health check failures** - Address issues promptly
4. **Test deployments in staging first** - Use manual verification workflow
5. **Keep workflows updated** - Review and update as the comments system evolves

## Troubleshooting

### Health Check Failures

**Provider API unavailable:**
- Check provider status pages
- Verify network connectivity
- Review API rate limits

**Configuration errors:**
- Verify environment variables
- Check config file syntax
- Ensure all required fields are present

**Test failures:**
- Review test logs
- Run tests locally
- Check for breaking changes

### Moderation Issues

**False positives:**
- Adjust spam keyword list
- Modify thresholds
- Add exceptions for trusted users

**Missed spam:**
- Add new keywords
- Lower thresholds
- Enable additional checks

### Deployment Verification Failures

**E2E test failures:**
- Check deployment logs
- Verify comments configuration
- Test manually in browser

**Performance issues:**
- Review bundle size
- Check network requests
- Optimize lazy loading

## Contributing

When modifying workflows:

1. Test changes in a fork first
2. Validate YAML syntax
3. Update this README
4. Document any new requirements
5. Test with manual triggers

## Support

For issues with these workflows:

1. Check workflow logs in Actions tab
2. Review this documentation
3. Check the main comments system documentation
4. Create an issue with the `ci-cd` label
