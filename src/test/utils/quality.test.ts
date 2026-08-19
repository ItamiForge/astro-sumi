import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

const root = process.cwd()

describe('quality gates', () => {
  test('CI, pre-push, and package.json share bun run verify', () => {
    const pkg = JSON.parse(
      readFileSync(resolve(root, 'package.json'), 'utf8'),
    ) as { scripts: Record<string, string> }

    expect(pkg.scripts['verify']).toContain('format:check')
    expect(pkg.scripts['verify']).toContain('lint')
    expect(pkg.scripts['verify']).toContain('test:run')
    expect(pkg.scripts['verify']).toContain('astro check')
    expect(pkg.scripts['verify']).toContain('security:check')

    const workflow = readFileSync(
      resolve(root, '.github/workflows/deploy.yml'),
      'utf8',
    )
    expect(workflow).toContain('bun run verify')
    expect(workflow).toContain('bun run build')

    const prePush = readFileSync(resolve(root, '.husky/pre-push'), 'utf8')
    expect(prePush).toContain('bun run verify')

    const preCommit = readFileSync(resolve(root, '.husky/pre-commit'), 'utf8')
    expect(preCommit).toContain('lint-staged')
  })
})
