import type { Entity } from './spinestack-entity'
import type { CollectionResponse } from './spinestack-response'

export type PreferenceEntity = Entity<PreferenceAttributes> & {
  type: 'PREFERENCE'
}

export interface PreferenceAttributes {
  key: string
  value: string
}

export type Preferences = Record<string, string>

export type PreferenceCollectionResponse = CollectionResponse<PreferenceEntity>
