/**
 * Fail build if project hero/gallery/processStrip images are reused across case studies.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectsDir = path.join(__dirname, '..', 'src', 'content', 'projects');

function collectPaths(project) {
  const paths = new Set();
  if (project.heroImage) paths.add(project.heroImage);
  for (const src of project.gallery ?? []) paths.add(src);
  for (const step of project.processStrip ?? []) {
    if (step.src) paths.add(step.src);
  }
  return paths;
}

function main() {
  if (!fs.existsSync(projectsDir)) {
    console.warn('No projects directory — skipping image validation.');
    return;
  }

  const files = fs.readdirSync(projectsDir).filter((f) => f.endsWith('.json'));
  /** @type {Map<string, string[]>} */
  const usage = new Map();

  for (const file of files) {
    const project = JSON.parse(fs.readFileSync(path.join(projectsDir, file), 'utf-8'));
    const slug = project.slug ?? file.replace(/\.json$/, '');
    for (const img of collectPaths(project)) {
      const list = usage.get(img) ?? [];
      list.push(slug);
      usage.set(img, list);
    }
  }

  const duplicates = [...usage.entries()].filter(([, slugs]) => slugs.length > 1);
  if (duplicates.length) {
    console.error('Duplicate project images detected:\n');
    for (const [img, slugs] of duplicates) {
      console.error(`  ${img}\n    used in: ${slugs.join(', ')}\n`);
    }
    process.exit(1);
  }

  console.log(`Project image validation passed (${files.length} case studies).`);
}

main();
