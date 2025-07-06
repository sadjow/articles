#!/bin/bash

# Script to prepare an article for publishing
# Usage: ./scripts/prepare-article.sh path/to/article.md

if [ -z "$1" ]; then
    echo "Usage: $0 path/to/article.md"
    exit 1
fi

ARTICLE_PATH="$1"

if [ ! -f "$ARTICLE_PATH" ]; then
    echo "Error: Article not found at $ARTICLE_PATH"
    exit 1
fi

# Update the published status
sed -i '' 's/published: false/published: true/' "$ARTICLE_PATH"

echo "✅ Article prepared for publishing: $ARTICLE_PATH"
echo "📝 To publish manually, push to main branch or run:"
echo "   gh workflow run publish-to-devto.yml -f article_path=$ARTICLE_PATH"