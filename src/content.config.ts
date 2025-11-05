import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const novels = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/novels' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(100),
      description: z.string().max(300),
      genre: z.array(z.string()).optional(),
      status: z
        .enum(['draft', 'ongoing', 'completed', 'hiatus'])
        .default('draft'),
      coverImage: image().optional(),
      author: z.string(), // Reference to author ID
      startDate: z.coerce.date(),
      lastUpdated: z.coerce.date().optional(),
      wordCount: z.number().optional(),
      tags: z.array(z.string()).optional(),
      mature: z.boolean().default(false),
      summary: z.string().optional(),
      draft: z.boolean().default(false),
    }),
})

const chapters = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/chapters' }),
  schema: z.object({
    title: z.string().max(100), // Chapter title
    novel: z.string(), // Reference to novel slug
    volume: z.number(),
    volumeTitle: z.string().optional(), // For URL: volume-1-the-beginning
    chapter: z.number(),
    publishDate: z.coerce.date(),
    wordCount: z.number().optional(),
    pageCount: z.number().optional(), // Estimated pages in this chapter
    summary: z.string().max(200).optional(),
    draft: z.boolean().default(false),
    order: z.number().default(0), // For sorting within same volume/chapter
    // Page navigation hints (optional)
    pageBreaks: z
      .array(
        z.object({
          title: z.string(),
          anchor: z.string(), // For #page-2 anchors
        }),
      )
      .optional(),
  }),
})

const authors = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/authors' }),
  schema: z.object({
    name: z.string(),
    penName: z.string().optional(),
    pronouns: z.string().optional(),
    avatar: z.string().url().or(z.string().startsWith('/')),
    bio: z.string().optional(),
    genres: z.array(z.string()).optional(),
    website: z.string().url().optional(),
    twitter: z.string().url().optional(),
    github: z.string().url().optional(),
    email: z.string().email().optional(),
    patreon: z.string().url().optional(),
    kofi: z.string().url().optional(),
  }),
})

export const collections = { novels, chapters, authors }
