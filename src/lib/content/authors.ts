import { getCollection, type CollectionEntry } from 'astro:content'
import { safeContentLoad } from '../errors'
import { validateContentIntegrity } from '../validation'

export async function getAllAuthors(): Promise<CollectionEntry<'authors'>[]> {
  return safeContentLoad(
    async () => {
      const authors = await getCollection('authors')
      
      const validAuthors = validateContentIntegrity(
        authors,
        (author) => {
          return !!(
            author.id &&
            author.data &&
            (author.data.name || author.data.penName)
          )
        },
        'authors'
      )
      
      return validAuthors
    },
    [],
    'getAllAuthors'
  )
}

export async function parseAuthors(authorIds: string[] = []) {
  return safeContentLoad(
    async () => {
      if (!authorIds.length) return []

      const allAuthors = await getAllAuthors()
      const authorMap = new Map(allAuthors.map((author) => [author.id, author]))

      return authorIds.map((id) => {
        const author = authorMap.get(id)
        return {
          id,
          name: author?.data?.name || author?.data?.penName || id,
          avatar: author?.data?.avatar || '/static/author-placeholder.svg',
          isRegistered: !!author,
        }
      })
    },
    [],
    'parseAuthors',
    { authorIds }
  )
}