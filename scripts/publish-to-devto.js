#!/usr/bin/env node

import fs from 'fs';
import matter from 'gray-matter';
import fetch from 'node-fetch';

async function getArticleByPath(apiKey, canonicalUrl) {
  try {
    const response = await fetch('https://dev.to/api/articles/me/published', {
      headers: {
        'api-key': apiKey,
      },
    });

    if (response.ok) {
      const articles = await response.json();
      return articles.find(article => article.canonical_url === canonicalUrl);
    }
  } catch (error) {
    console.error('Error fetching articles:', error.message);
  }
  return null;
}

async function publishToDevTo(filePath) {
  try {
    // Read the file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content } = matter(fileContent);

    // Check if article should be published
    if (frontmatter.published === false) {
      console.log(`Skipping ${filePath} - published: false`);
      return;
    }

    // Prepare article data
    const article = {
      title: frontmatter.title,
      body_markdown: content,
      published: true,
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      description: frontmatter.description || '',
      canonical_url: frontmatter.canonical_url || `https://github.com/sadjow/articles/blob/main/${filePath}`,
    };

    if (frontmatter.cover_image) {
      article.main_image = frontmatter.cover_image;
    }

    if (frontmatter.series) {
      article.series = frontmatter.series;
    }

    // Check for dry run
    const isDryRun = process.env.DRY_RUN === 'true';
    
    if (isDryRun) {
      console.log(`🔍 DRY RUN: Would publish article:`);
      console.log(`   Title: ${article.title}`);
      console.log(`   Tags: ${article.tags.join(', ')}`);
      console.log(`   Description: ${article.description}`);
      console.log(`   Canonical URL: ${article.canonical_url}`);
      return;
    }

    const apiKey = process.env.DEV_TO_API_KEY;
    if (!apiKey) {
      throw new Error('DEV_TO_API_KEY environment variable is required');
    }

    // Check if article already exists
    let existingArticle = null;
    if (frontmatter.dev_to_id) {
      // If we have an ID, use it
      existingArticle = { id: frontmatter.dev_to_id };
    } else {
      // Otherwise, try to find by canonical URL
      existingArticle = await getArticleByPath(apiKey, article.canonical_url);
    }

    let response;
    let result;

    if (existingArticle) {
      // Update existing article
      console.log(`📝 Updating existing article (ID: ${existingArticle.id})`);
      response = await fetch(`https://dev.to/api/articles/${existingArticle.id}`, {
        method: 'PUT',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ article }),
      });
    } else {
      // Create new article
      console.log(`📤 Publishing new article`);
      response = await fetch('https://dev.to/api/articles', {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ article }),
      });
    }

    if (response.ok) {
      result = await response.json();
      const action = existingArticle ? 'Updated' : 'Published';
      console.log(`✅ ${action}: ${frontmatter.title}`);
      console.log(`   URL: ${result.url}`);
      
      // Update frontmatter with dev.to info
      let updatedContent = fileContent;
      
      // Add or update dev_to_id
      if (!frontmatter.dev_to_id) {
        const devtoMeta = `\ndev_to_id: ${result.id}\ndev_to_url: ${result.url}`;
        updatedContent = updatedContent.replace(
          /^(---[\s\S]*?)(\n---)/m,
          `$1${devtoMeta}$2`
        );
      } else if (frontmatter.dev_to_url !== result.url) {
        // Update URL if it changed
        updatedContent = updatedContent.replace(
          /dev_to_url:\s*.*/,
          `dev_to_url: ${result.url}`
        );
      }
      
      // Ensure published is true
      updatedContent = updatedContent.replace(
        /published:\s*false/,
        'published: true'
      );
      
      fs.writeFileSync(filePath, updatedContent);
    } else {
      const error = await response.text();
      console.error(`❌ Failed to publish ${filePath}: ${error}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
    process.exit(1);
  }
}

// Main execution
async function main() {
  const articles = process.argv.slice(2).filter(Boolean);
  
  if (articles.length === 0) {
    console.error('❌ No articles provided');
    process.exit(1);
  }
  
  for (const article of articles) {
    await publishToDevTo(article);
  }
}

main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});