import type { Entity } from './spinestack-entity'
import type { Dimensions } from './spinestack-dimensions'

export type ImporterSourceEntity = Entity<ImporterSourceAttributes> & {
  type: 'IMPORTER_SOURCE'
}

export interface ImporterSourceAttributes {
  name: string
  description: Record<string, string>
  language: string
  url: string
}

export type ImporterSources = 'cbl' | 'open_library' | 'skoob'

export interface ImportOneBook {
  id: string
  isbn: string
  collection: string
  source: Uppercase<ImporterSources>
  // Book data to import directly without re-fetching
  title?: string
  contributors?: Array<{ name: string; role: string }>
  publisher?: string
  synopsis?: string
  dimensions?: Dimensions
  coverUrl?: string
  pageCount?: number
  url?: string
}
