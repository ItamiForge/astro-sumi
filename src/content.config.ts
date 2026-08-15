import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const visibility = z.enum(['public', 'spoiler', 'secret']).default('public')

const relationship = z.object({
  person: z.string(),
  kind: z.string(),
})

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
      author: z.string(),
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
    title: z.string().max(100),
    novel: z.string(),
    volume: z.number(),
    volumeTitle: z.string().optional(),
    chapter: z.number(),
    publishDate: z.coerce.date(),
    wordCount: z.number().optional(),
    pageCount: z.number().optional(),
    summary: z.string().max(200).optional(),
    draft: z.boolean().default(false),
    order: z.number().default(0),
    pageBreaks: z
      .array(
        z.object({
          title: z.string(),
          anchor: z.string(),
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

const characters = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/characters' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      aliases: z.array(z.string()).optional(),
      titles: z.array(z.string()).optional(),
      pronouns: z.string().optional(),
      role: z
        .enum([
          'protagonist',
          'deuteragonist',
          'supporting',
          'antagonist',
          'mentioned',
          'mythic',
        ])
        .default('supporting'),
      status: z
        .enum(['alive', 'dead', 'unknown', 'mythic', 'reincarnating'])
        .default('unknown'),
      species: z.string().optional(),
      home: z.string().optional(),
      allegiance: z.array(z.string()).optional(),
      relationships: z.array(relationship).optional(),
      incarnationOf: z.string().optional(),
      novel: z.string().optional(),
      era: z.string().optional(),
      shortBio: z.string().max(280),
      portrait: image().optional(),
      tags: z.array(z.string()).optional(),
      visibility,
      revealedIn: z.string().optional(),
      draft: z.boolean().default(false),
    }),
})

const locations = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/locations' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      aliases: z.array(z.string()).optional(),
      kind: z
        .enum([
          'galaxy',
          'sector',
          'system',
          'world',
          'region',
          'city',
          'site',
          'ship',
          'station',
          'other',
        ])
        .default('other'),
      parent: z.string().optional(),
      novel: z.string().optional(),
      era: z.string().optional(),
      climate: z.string().optional(),
      government: z.string().optional(),
      shortBio: z.string().max(280),
      image: image().optional(),
      coords: z
        .object({
          map: z.string(),
          x: z.number(),
          y: z.number(),
        })
        .optional(),
      tags: z.array(z.string()).optional(),
      visibility,
      revealedIn: z.string().optional(),
      draft: z.boolean().default(false),
    }),
})

const factions = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/factions' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      aliases: z.array(z.string()).optional(),
      motto: z.string().optional(),
      kind: z
        .enum([
          'village',
          'house',
          'order',
          'empire',
          'cult',
          'crew',
          'fleet',
          'guild',
          'other',
        ])
        .default('other'),
      headquarters: z.string().optional(),
      novel: z.string().optional(),
      era: z.string().optional(),
      shortBio: z.string().max(280),
      banner: image().optional(),
      tags: z.array(z.string()).optional(),
      visibility,
      revealedIn: z.string().optional(),
      draft: z.boolean().default(false),
    }),
})

const species = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/species' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      aliases: z.array(z.string()).optional(),
      homeworld: z.string().optional(),
      lifespan: z.string().optional(),
      novel: z.string().optional(),
      era: z.string().optional(),
      shortBio: z.string().max(280),
      image: image().optional(),
      tags: z.array(z.string()).optional(),
      visibility,
      revealedIn: z.string().optional(),
      draft: z.boolean().default(false),
    }),
})

const maps = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/maps' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      kind: z
        .enum(['star-chart', 'system', 'world', 'region', 'city', 'cutaway'])
        .default('region'),
      novel: z.string().optional(),
      era: z.string().optional(),
      shortBio: z.string().max(280),
      plate: image().optional(),
      parentMap: z.string().optional(),
      tags: z.array(z.string()).optional(),
      visibility,
      revealedIn: z.string().optional(),
      draft: z.boolean().default(false),
    }),
})

export const collections = {
  novels,
  chapters,
  authors,
  characters,
  locations,
  factions,
  species,
  maps,
}
