import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const mcps = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './content/mcps' }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    benefits: z.string(),
    author: z.string(),
    repository: z.string().url(),
    version: z.string(),
    license: z.string(),
    pricing: z.enum(['free', 'freemium', 'paid']),
    prerequisites: z.array(z.string()),
    category: z.literal('mcp'),
    domains: z.array(z.string()),
    tags: z.array(z.string()),
    tools: z.array(z.string()),
    status: z.enum(['active', 'deprecated', 'beta']),
    installMethod: z.string(),
    installCommand: z.string(),
    compatibility: z.array(z.string()),
    featured: z.boolean().default(false),
    addedAt: z.string(),
    updatedAt: z.string(),
    cases: z.array(z.string()).default([]),
  }),
});

const skills = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './content/skills' }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    benefits: z.string(),
    author: z.string(),
    repository: z.string().url(),
    version: z.string(),
    license: z.string(),
    pricing: z.enum(['free', 'freemium', 'paid']),
    prerequisites: z.array(z.string()),
    category: z.literal('skill'),
    domains: z.array(z.string()),
    tags: z.array(z.string()),
    platform: z.string(),
    installMethod: z.string(),
    installCommand: z.string(),
    status: z.enum(['active', 'deprecated', 'beta']),
    featured: z.boolean().default(false),
    addedAt: z.string(),
    updatedAt: z.string().optional(),
    cases: z.array(z.string()).default([]),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './content/guides' }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    tags: z.array(z.string()),
    order: z.number(),
    addedAt: z.string(),
  }),
});

const cases = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './content/cases' }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    type: z.enum(['blog', 'video', 'paper', 'tutorial']),
    url: z.string().url(),
    author: z.string(),
    relatedItems: z.array(z.string()),
    language: z.string().default('ko'),
    addedAt: z.string(),
  }),
});

export const collections = { mcps, skills, guides, cases };
