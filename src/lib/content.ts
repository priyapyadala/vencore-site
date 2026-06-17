import { getCollection } from 'astro:content';

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

export interface ProjectTestimonial {
  quote: string;
  name: string;
  role: string;
  attribution: 'first-name-role' | 'full' | 'anonymous';
}

export interface ProjectProcessStep {
  label: string;
  src: string;
  alt: string;
}

export interface ProjectOutcome {
  area: string;
  timeline: string;
  handover: string;
  summary: string;
}

export interface Project {
  title: string;
  slug: string;
  category: string;
  location: string;
  year: string;
  area: string;
  featuredRank?: number;
  heroImage: string;
  overview: string;
  brief?: string;
  approach?: string;
  materials?: string[];
  scope: string[];
  execution: { timeline: string; details: string };
  outcome?: ProjectOutcome;
  processStrip?: ProjectProcessStep[];
  testimonial?: ProjectTestimonial;
  relatedProjectSlugs?: string[];
  gallery: string[];
}

export interface Insight {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  heroImage: string;
  topic: string;
  author?: string;
  relatedService?: string;
  content: string;
}

const [projectEntries, serviceEntries, insightEntries] = await Promise.all([
  getCollection('projects'),
  getCollection('services'),
  getCollection('insights'),
]);

const projects: Project[] = projectEntries.map((entry) => entry.data);
const services: Service[] = serviceEntries.map((entry) => entry.data);
const insights: Insight[] = insightEntries
  .map((entry) => ({
    title: entry.data.title,
    slug: entry.data.slug,
    date: entry.data.date,
    excerpt: entry.data.excerpt,
    heroImage: entry.data.heroImage,
    topic: entry.data.topic,
    author: entry.data.author,
    relatedService: entry.data.relatedService,
    content: entry.body ?? '',
  }))
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export function getServices(): Service[] {
  return services;
}

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function getProjects(): Project[] {
  return projects;
}

export function getFeaturedProjects(limit = 4): Project[] {
  return [...projects]
    .sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99))
    .slice(0, limit);
}

export function getRelatedProjects(slug: string, limit = 3): Project[] {
  const project = getProject(slug);
  if (!project) return [];
  const preferred = project.relatedProjectSlugs ?? [];
  const all = projects.filter((p) => p.slug !== slug);
  const picked: Project[] = [];
  for (const s of preferred) {
    const match = all.find((p) => p.slug === s);
    if (match) picked.push(match);
  }
  for (const p of all) {
    if (picked.length >= limit) break;
    if (picked.some((x) => x.slug === p.slug)) continue;
    if (p.category === project.category) picked.push(p);
  }
  return picked.slice(0, limit);
}

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getInsights(): Insight[] {
  return insights;
}

export function getInsight(slug: string): Insight | undefined {
  return insights.find((i) => i.slug === slug);
}

export function getInsightTopics(): string[] {
  const topics = new Set(insights.map((i) => i.topic));
  return [...topics];
}

export function getInsightNeighbors(slug: string): {
  prev?: Insight;
  next?: Insight;
  related: Insight[];
} {
  const index = insights.findIndex((a) => a.slug === slug);
  if (index === -1) return { related: [] };

  const prev = index < insights.length - 1 ? insights[index + 1] : undefined;
  const next = index > 0 ? insights[index - 1] : undefined;
  const related = insights.filter((a) => a.slug !== slug).slice(0, 2);

  return { prev, next, related };
}
