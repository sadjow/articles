#!/usr/bin/env node

import fs from 'fs';
import matter from 'gray-matter';
import fetch from 'node-fetch';

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

    // Make API request
    const response = await fetch('https://dev.to/api/articles', {
      method: 'POST',
      headers: {
        'api-key': process.env.DEV_TO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ article }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Published: ${frontmatter.title}`);
      console.log(`   URL: ${result.url}`);
      
      // Update published status to true
      let updatedContent = fileContent.replace(
        /published:\s*false/,
        'published: true'
      );
      
      // Add dev.to URL as a comment for reference
      const devtoComment = `\ndev_to_url: ${result.url}`;
      if (!frontmatter.dev_to_url) {
        updatedContent = updatedContent.replace(
          /^(---[\s\S]*?)(\n---)/m,
          `$1${devtoComment}$2`
        );
      }
      
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