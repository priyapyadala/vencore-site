import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const root = process.cwd();

export interface ServiceConcept {
  src: string;
  alt: string;
  category: string;
  name: string;
  note: string;
}

export interface Service {
  title: string;
  slug: string;
  category: string;
  heroImage: string;
  megaMenuPreview: string;
  philosophy: string;
  scope: string[];
  concepts: ServiceConcept[];
  relatedProjectSlugs: string[];
}

export interface Project {
  title: string;
  slug: string;
  category: string;
  location: string;
  year: string;
  area: string;
  heroImage: string;
  overview: string;
  scope: string[];
  execution: { timeline: string; details: string };
  gallery: string[];
}

export interface Insight {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  heroImage: string;
  topic: string;
  content: string;
}

function readJsonDir<T>(dir: string): T[] {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(full, f), 'utf-8')) as T);
}

export function getServices(): Service[] {
  return readJsonDir<Service>('src/content/services');
}

export function getService(slug: string): Service | undefined {
  return getServices().find((s) => s.slug === slug);
}

export function getProjects(): Project[] {
  return readJsonDir<Project>('src/content/projects');
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}

export function getInsights(): Insight[] {
  const full = path.join(root, 'src/content/insights');
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(full, f), 'utf-8');
      const { data, content } = matter(raw);
      return {
        title: data.title as string,
        slug: data.slug as string,
        date: data.date as string,
        excerpt: data.excerpt as string,
        heroImage: data.heroImage as string,
        topic: (data.topic as string) || 'Practice',
        content,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getInsight(slug: string): Insight | undefined {
  return getInsights().find((i) => i.slug === slug);
}

export function getInsightTopics(): string[] {
  const topics = new Set(getInsights().map((i) => i.topic));
  return [...topics];
}

export function getInsightNeighbors(slug: string): {
  prev?: Insight;
  next?: Insight;
  related: Insight[];
} {
  const articles = getInsights();
  const index = articles.findIndex((a) => a.slug === slug);
  if (index === -1) return { related: [] };

  const prev = index < articles.length - 1 ? articles[index + 1] : undefined;
  const next = index > 0 ? articles[index - 1] : undefined;
  const related = articles.filter((a) => a.slug !== slug).slice(0, 2);

  return { prev, next, related };
}
