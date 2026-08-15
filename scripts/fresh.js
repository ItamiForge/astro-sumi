#!/usr/bin/env node

import { createInterface } from 'node:readline'
import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')

const CONTENT_DIRS = [
  'novels',
  'chapters',
  'characters',
  'locations',
  'factions',
  'species',
  'maps',
  'terms',
  'events',
  'documents',
  'relics',
]

const KEEP = new Set(['src/content/authors/template-author.md'])

function isMarkdown(name) {
  return /\.(md|mdx)$/i.test(name)
}

function listDeletions() {
  const files = []
  for (const dir of CONTENT_DIRS) {
    const abs = join(root, 'src/content', dir)
    if (!existsSync(abs)) continue
    for (const name of readdirSync(abs)) {
      if (!isMarkdown(name)) continue
      const rel = `src/content/${dir}/${name}`
      if (KEEP.has(rel)) continue
      files.push(rel)
    }
  }
  const authors = join(root, 'src/content/authors')
  if (existsSync(authors)) {
    for (const name of readdirSync(authors)) {
      const rel = `src/content/authors/${name}`
      if (isMarkdown(name) && !KEEP.has(rel)) files.push(rel)
    }
  }
  return files
}

function wipe(files) {
  for (const rel of files) {
    unlinkSync(join(root, rel))
  }
  for (const dir of [...CONTENT_DIRS, 'authors']) {
    const abs = join(root, 'src/content', dir)
    mkdirSync(abs, { recursive: true })
    writeFileSync(join(abs, '.gitkeep'), '')
  }
}

async function confirm() {
  if (process.argv.includes('--yes')) return true
  const files = listDeletions()
  process.stdout.write(
    `This deletes ${files.length} sample markdown files and leaves empty Codex folders.\nAuthor file template-author.md is kept. Continue? [y/N] `,
  )
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await new Promise((resolve) => {
    rl.once('line', resolve)
  })
  rl.close()
  return String(answer).trim().toLowerCase() === 'y'
}

const files = listDeletions()
if (files.length === 0) {
  for (const dir of [...CONTENT_DIRS, 'authors']) {
    const abs = join(root, 'src/content', dir)
    mkdirSync(abs, { recursive: true })
    writeFileSync(join(abs, '.gitkeep'), '')
  }
  console.log('Nothing to delete. Empty content folders are ready.')
  process.exit(0)
}

if (!(await confirm())) {
  console.log('Aborted.')
  process.exit(1)
}

wipe(files)
console.log(`Removed ${files.length} sample files. Add your own markdown under src/content/.`)
