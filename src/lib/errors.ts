/**
 * Centralized error handling system for Astro Sumi
 * 
 * This module provides error classes, logging utilities, and safe content loading
 * functions with graceful degradation for missing or invalid content.
 */

/**
 * Base error class for content-related errors
 */
export class ContentError extends Error {
  constructor(
    message: string,
    public type: 'CONTENT_NOT_FOUND' | 'CONTENT_INVALID' | 'CONTENT_LOAD_FAILED',
    public context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ContentError'
  }
}

/**
 * Error class for validation failures
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: unknown
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Enhanced logging utility with context
 */
export class Logger {
  private static isDevelopment = import.meta.env.DEV

  static error(message: string, error?: Error, context?: Record<string, unknown>) {
    const logData = {
      message,
      error: error?.message,
      stack: this.isDevelopment ? error?.stack : undefined,
      context,
      timestamp: new Date().toISOString(),
    }
    
    console.error('[Astro Sumi Error]', logData)
  }

  static warn(message: string, context?: Record<string, unknown>) {
    const logData = {
      message,
      context,
      timestamp: new Date().toISOString(),
    }
    
    console.warn('[Astro Sumi Warning]', logData)
  }

  static info(message: string, context?: Record<string, unknown>) {
    if (this.isDevelopment) {
      const logData = {
        message,
        context,
        timestamp: new Date().toISOString(),
      }
      
      console.info('[Astro Sumi Info]', logData)
    }
  }
}

/**
 * Safe content loading wrapper with error handling and fallbacks
 */
export async function safeContentLoad<T>(
  operation: () => Promise<T>,
  fallback: T,
  operationName: string,
  context?: Record<string, unknown>
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    Logger.error(
      `Content loading failed for ${operationName}`,
      error instanceof Error ? error : new Error(String(error)),
      context
    )
    
    return fallback
  }
}

/**
 * Safe content loading wrapper that returns result with error state
 */
export async function safeContentLoadWithError<T>(
  operation: () => Promise<T>,
  operationName: string,
  context?: Record<string, unknown>
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const data = await operation()
    return { data, error: null }
  } catch (error) {
    const errorInstance = error instanceof Error ? error : new Error(String(error))
    
    Logger.error(
      `Content loading failed for ${operationName}`,
      errorInstance,
      context
    )
    
    return { data: null, error: errorInstance }
  }
}

/**
 * Graceful degradation helper for missing content
 */
export function createFallbackContent<T>(
  type: string,
  id: string,
  defaultData: Partial<T>
): T {
  Logger.warn(`Using fallback content for ${type}`, { id, type })
  
  return {
    id,
    ...defaultData,
  } as T
}

/**
 * Retry mechanism for transient failures
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  operationName?: string
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt === maxRetries) {
        Logger.error(
          `Operation failed after ${maxRetries} attempts: ${operationName || 'unknown'}`,
          lastError,
          { attempt, maxRetries }
        )
        throw lastError
      }
      
      Logger.warn(
        `Operation failed, retrying (${attempt}/${maxRetries}): ${operationName || 'unknown'}`,
        { attempt, maxRetries, error: lastError.message }
      )
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
  
  throw lastError!
}