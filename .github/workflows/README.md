# GitHub Actions for Articles

## Publish to dev.to

This workflow automatically publishes articles to dev.to when:
1. Articles are pushed to the main branch with `published: true`
2. Manually triggered via GitHub Actions UI

### Setup

1. **Get your dev.to API key**:
   - Go to https://dev.to/settings/extensions
   - Generate a new API key
   
2. **Add the API key to GitHub**:
   - Go to your repository settings
   - Navigate to Secrets and variables > Actions
   - Add a new secret named `DEV_TO_API_KEY`

### How it works

- **Automatic**: When you push an article with `published: true` to main, it publishes to dev.to
- **Manual**: Use GitHub Actions UI to publish specific articles
- **Updates**: The action updates the article's `canonical_url` after publishing

### Publishing an article

1. Write your article with `published: false`
2. When ready, change to `published: true`
3. Push to main branch
4. The article will be automatically published to dev.to

### Manual publishing

```bash
# Using GitHub CLI
gh workflow run publish-to-devto.yml -f article_path=technical/2025/article.md
```