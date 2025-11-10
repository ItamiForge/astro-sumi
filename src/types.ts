export type Site = {
  title: string
  description: string
  href: string
  author: string
  locale: string
  featuredNovelCount: number
  novelsPerPage: number
}

export type SocialLink = {
  href: string
  label: string
}

import type { ComponentProps } from 'react'
import type { Icon } from '@/components/Icon'

type IconName = ComponentProps<typeof Icon>['name']

export type IconMap = {
  [key: string]: IconName
}

export type Font = {
  id: string
  name: string
  cssName: string
  file: string
  format: string
  variable: boolean
  fallback: string
  default?: boolean
}

export type FontConfig = {
  [key: string]: Font
}
