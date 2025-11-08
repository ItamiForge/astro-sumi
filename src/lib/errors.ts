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

