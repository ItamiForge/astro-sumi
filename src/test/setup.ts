// Mock environment variables for testing
Object.defineProperty(import.meta, 'env', {
  value: {
    GISCUS_REPO: 'test/repo',
    GISCUS_REPO_ID: 'R_testRepoId',
    GISCUS_CATEGORY: 'Test Category',
    GISCUS_CATEGORY_ID: 'DIC_testCategoryId',
    GISCUS_LANG: 'en',
    GISCUS_REACTIONS_ENABLED: 'true',
    GISCUS_ENABLED: 'true',
    GISCUS_MAPPING: 'pathname',
    GISCUS_THEME: 'auto',
    GISCUS_LOADING: 'lazy',
    GISCUS_EMIT_METADATA: 'false'
  },
  writable: true
})

// Mock process.env for Node.js environment
global.process = global.process || {}
global.process.env = global.process.env || {}
Object.assign(global.process.env, {
  GISCUS_REPO: 'test/repo',
  GISCUS_REPO_ID: 'R_testRepoId',
  GISCUS_CATEGORY: 'Test Category',
  GISCUS_CATEGORY_ID: 'DIC_testCategoryId'
})