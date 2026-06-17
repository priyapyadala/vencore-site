import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const serviceConceptSchema = z.object({
  src: z.string(),
  alt: z.string(),
  category: z.string(),
  name: z.string(),
  note: z.string(),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    category: z.string(),
    heroImage: z.string(),
    megaMenuPreview: z.string(),
    philosophy: z.string(),
    scope: z.array(z.string()),
    concepts: z.array(serviceConceptSchema),
    relatedProjectSlugs: z.array(z.string()),
  }),
});

const projectTestimonialSchema = z.object({
  quote: z.string(),
  name: z.string(),
  role: z.string(),
  attribution: z.enum(['first-name-role', 'full', 'anonymous']),
});

const projectProcessStepSchema = z.object({
  label: z.string(),
  src: z.string(),
  alt: z.string(),
});

const projectOutcomeSchema = z.object({
  area: z.string(),
  timeline: z.string(),
  handover: z.string(),
  summary: z.string(),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    category: z.string(),
    location: z.string(),
    year: z.string(),
    area: z.string(),
    featuredRank: z.number().optional(),
    heroImage: z.string(),
    overview: z.string(),
    brief: z.string().optional(),
    approach: z.string().optional(),
    materials: z.array(z.string()).optional(),
    scope: z.array(z.string()),
    execution: z.object({
      timeline: z.string(),
      details: z.string(),
    }),
    outcome: projectOutcomeSchema.optional(),
    processStrip: z.array(projectProcessStepSchema).optional(),
    testimonial: projectTestimonialSchema.optional(),
    relatedProjectSlugs: z.array(z.string()).optional(),
    gallery: z.array(z.string()),
  }),
});

const insights = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/insights' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.string(),
    excerpt: z.string(),
    heroImage: z.string(),
    topic: z.string().default('Practice'),
    author: z.string().default('Vencore Practice'),
    relatedService: z.string().optional(),
  }),
});

export const collections = { services, projects, insights };
