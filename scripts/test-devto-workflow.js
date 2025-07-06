#!/usr/bin/env node

const fs = require('fs');
const matter = require('gray-matter');

const testFile = 'technical/2025/test-devto-publishing.md';

try {
  if (fs.existsSync(testFile)) {
    const fileContent = fs.readFileSync(testFile, 'utf8');
    const { data: frontmatter, content } = matter(fileContent);
    
    console.log('🔍 Test article found:');
    console.log(`   Title: ${frontmatter.title}`);
    console.log(`   Published: ${frontmatter.published}`);
    console.log(`   Tags: ${frontmatter.tags?.join(', ')}`);
    console.log('✅ Dry run test passed!');
  } else {
    console.error('❌ Test article not found');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error during test:', error.message);
  process.exit(1);
}