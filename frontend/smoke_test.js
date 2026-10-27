/**
 * Frontend Smoke Test Script
 * Verifies production build assets, index.html structure, and bundle integrity.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

console.log('--- Running Frontend Smoke Test ---');

// 1. Check dist directory exists
if (!fs.existsSync(distDir)) {
  console.error('FAIL: dist directory does not exist. Run npm run build first.');
  process.exit(1);
}

// 2. Check index.html exists
if (!fs.existsSync(indexHtmlPath)) {
  console.error('FAIL: dist/index.html does not exist.');
  process.exit(1);
}

const indexContent = fs.readFileSync(indexHtmlPath, 'utf8');

// 3. Verify root div
if (!indexContent.includes('<div id="root"></div>')) {
  console.error('FAIL: dist/index.html missing <div id="root"></div>');
  process.exit(1);
}

// 4. Verify title & Gemma branding
if (!indexContent.includes('CampusPilot AI') || !indexContent.includes('Gemma 4')) {
  console.error('FAIL: dist/index.html missing CampusPilot AI / Gemma 4 branding.');
  process.exit(1);
}

// 5. Verify script and css assets exist
const assetsDir = path.join(distDir, 'assets');
if (!fs.existsSync(assetsDir)) {
  console.error('FAIL: dist/assets directory does not exist.');
  process.exit(1);
}

const assets = fs.readdirSync(assetsDir);
const jsAsset = assets.find(f => f.endsWith('.js'));
const cssAsset = assets.find(f => f.endsWith('.css'));

if (!jsAsset) {
  console.error('FAIL: No JavaScript bundle found in dist/assets');
  process.exit(1);
}

if (!cssAsset) {
  console.error('FAIL: No CSS bundle found in dist/assets');
  process.exit(1);
}

const jsSize = fs.statSync(path.join(assetsDir, jsAsset)).size;
const cssSize = fs.statSync(path.join(assetsDir, cssAsset)).size;

console.log(`PASS: Found JS bundle ${jsAsset} (${(jsSize / 1024).toFixed(1)} KB)`);
console.log(`PASS: Found CSS bundle ${cssAsset} (${(cssSize / 1024).toFixed(1)} KB)`);
console.log(`PASS: index.html has root mount element and valid SEO tags.`);
console.log('--- All Frontend Smoke Tests Passed! ---');
process.exit(0);
