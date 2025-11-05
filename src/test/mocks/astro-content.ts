// Mock data for testing content collections
const mockNovels = [
  {
    id: 'chronicles-of-aethermoor',
    data: {
      title: 'The Chronicles of Aethermoor',
      description: 'A fantasy epic following young mage Lyra',
      genre: ['fantasy', 'adventure', 'coming-of-age'],
      status: 'ongoing',
      author: 'template-author',
      startDate: new Date('2024-01-15'),
      lastUpdated: new Date('2024-03-10'),
      wordCount: 45000,
      tags: ['magic', 'technology', 'destiny', 'friendship', 'academy'],
      mature: false,
      draft: false,
      comments: {
        enabled: true,
        category: 'Fantasy Discussions'
      }
    },
    body: 'Mock novel content'
  },
  {
    id: 'whispers-in-the-void',
    data: {
      title: 'Whispers in the Void',
      description: 'A sci-fi thriller',
      genre: ['sci-fi', 'thriller'],
      status: 'ongoing',
      author: 'template-author',
      startDate: new Date('2024-02-01'),
      tags: ['space', 'mystery'],
      mature: false,
      draft: false
    },
    body: 'Mock novel content'
  }
]

const mockChapters = [
  {
    id: 'chronicles-of-aethermoor-v1-c1',
    data: {
      title: 'The Fractured Crystal',
      novel: 'chronicles-of-aethermoor',
      volume: 1,
      volumeTitle: 'the-awakening',
      chapter: 1,
      publishDate: new Date('2024-01-15'),
      wordCount: 3200,
      pageCount: 8,
      summary: 'Lyra\'s first day at the Academy takes a dangerous turn',
      draft: false,
      order: 1,
      comments: {
        enabled: true,
        customTerm: 'Chapter 1: The Fractured Crystal - Discussion'
      }
    },
    body: '<h1>Chapter 1: The Fractured Crystal</h1><p>The floating city of Aethermoor stretched endlessly before Lyra Nightwhisper as the transport crystal carried her through the morning clouds. This is a test chapter with multiple paragraphs to test word counting and reading time calculations.</p><p>More content here to make it substantial for testing purposes. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>'
  },
  {
    id: 'chronicles-of-aethermoor-v1-c2',
    data: {
      title: 'Echoes of Power',
      novel: 'chronicles-of-aethermoor',
      volume: 1,
      volumeTitle: 'the-awakening',
      chapter: 2,
      publishDate: new Date('2024-01-22'),
      wordCount: 3500,
      draft: false,
      order: 2
    },
    body: '<h1>Chapter 2: Echoes of Power</h1><p>Following the events of the first chapter, Lyra must come to terms with her newfound abilities. This chapter continues the story with more detailed content for testing purposes.</p>'
  },
  {
    id: 'whispers-in-the-void-v1-c1',
    data: {
      title: 'Signal Lost',
      novel: 'whispers-in-the-void',
      volume: 1,
      chapter: 1,
      publishDate: new Date('2024-02-01'),
      wordCount: 2800,
      draft: false,
      order: 1
    },
    body: '<h1>Chapter 1: Signal Lost</h1><p>In the depths of space, communication is everything. This sci-fi chapter provides different content for testing cross-novel functionality.</p>'
  }
]

const mockAuthors = [
  {
    id: 'template-author',
    data: {
      name: 'Template Author',
      penName: 'T.A. Example',
      avatar: '/static/author-placeholder.svg',
      bio: 'A fantasy and sci-fi author',
      genres: ['fantasy', 'sci-fi']
    },
    body: 'Author bio content'
  }
]

export async function getCollection(collection: string) {
  switch (collection) {
    case 'novels':
      return mockNovels
    case 'chapters':
      return mockChapters
    case 'authors':
      return mockAuthors
    default:
      return []
  }
}

export async function render(_entry: any) {
  return {
    Content: () => null,
    headings: [
      { slug: 'chapter-1-the-fractured-crystal', text: 'Chapter 1: The Fractured Crystal', depth: 1 },
      { slug: 'academy-arrival', text: 'Academy Arrival', depth: 2 },
      { slug: 'the-crystal-laboratory', text: 'The Crystal Laboratory', depth: 2 },
      { slug: 'resonance-gone-wrong', text: 'Resonance Gone Wrong', depth: 2 },
      { slug: 'aftermath-and-questions', text: 'Aftermath and Questions', depth: 2 }
    ],
    remarkPluginFrontmatter: {}
  }
}

export type CollectionEntry<T> = T extends 'novels' 
  ? typeof mockNovels[0]
  : T extends 'chapters'
  ? typeof mockChapters[0] 
  : T extends 'authors'
  ? typeof mockAuthors[0]
  : never