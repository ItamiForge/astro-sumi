/**
 * Content validation utilities
 * 
 * This module provides validation functions for content integrity checking.
 */

import { Logger } from './errors'

/**
 * Runtime content validation for loaded content
 */
export function validateContentIntegrity<T>(
  content: T[],
  validator: (item: T) => boolean,
  contentType: string
): T[] {
  const validContent: T[] = []
  const invalidItems: unknown[] = []

  for (const item of content) {
    try {
      if (validator(item)) {
        validContent.push(item)
      } else {
        invalidItems.push(item)
      }
    } catch (error) {
      Logger.warn(`Invalid ${contentType} item found`, { item, error })
      invalidItems.push(item)
    }
  }

  if (invalidItems.length > 0) {
    Logger.warn(`Found ${invalidItems.length} invalid ${contentType} items`, {
      invalidCount: invalidItems.length,
      totalCount: content.length,
      contentType
    })
  }

  return validContent
}