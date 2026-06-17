/**
 * Lighthouse CI assertions for production preview.
 * Start preview first: npm run build && npm run preview
 * Then: npm run lighthouse
 *
 * Override base URL: LHCI_URL=http://127.0.0.1:4321 npm run lighthouse
 */
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const BASE_URL = (process.env.LHCI_URL || 'http://127.0.0.1:4321').replace(/\/$/, '');
const PATHS = ['/', '/contact/', '/projects/'];

const THRESHOLDS = {
  performance: 90,
  accessibility: 95,
  seo: 100,
};

async function auditPath(path, port) {
  const url = `${BASE_URL}${path}`;
  const result = await lighthouse(url, {
    port,
    output: 'json',
    logLevel: 'error',
    onlyCategories: ['performance', 'accessibility', 'seo'],
  });

  if (!result?.lhr) throw new Error(`No Lighthouse result for ${url}`);

  const scores = {
    performance: Math.round((result.lhr.categories.performance?.score ?? 0) * 100),
    accessibility: Math.round((result.lhr.categories.accessibility?.score ?? 0) * 100),
    seo: Math.round((result.lhr.categories.seo?.score ?? 0) * 100),
  };

  return { path, url, scores };
}

function assertScores({ path, scores }) {
  const failures = [];
  for (const [category, min] of Object.entries(THRESHOLDS)) {
    if (scores[category] < min) {
      failures.push(`${category} ${scores[category]} < ${min}`);
    }
  }
  if (failures.length) {
    throw new Error(`${path}: ${failures.join('; ')}`);
  }
}

async function main() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox'] });
  const results = [];

  try {
    for (const path of PATHS) {
      const report = await auditPath(path, chrome.port);
      results.push(report);
      console.log(
        `${path} — perf ${report.scores.performance}, a11y ${report.scores.accessibility}, seo ${report.scores.seo}`,
      );
      assertScores(report);
    }
    console.log('\nAll Lighthouse thresholds passed.');
  } finally {
    await chrome.kill();
  }
}

main().catch((err) => {
  console.error('\nLighthouse CI failed:', err.message || err);
  process.exit(1);
});
