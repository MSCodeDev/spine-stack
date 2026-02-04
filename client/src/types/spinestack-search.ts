import type { BookEntity } from './spinestack-book'
import type { CollectionEntity } from './spinestack-collection'
import type { PersonEntity } from './spinestack-person'
import type { PublisherEntity } from './spinestack-publisher'
import type { SeriesEntity } from './spinestack-series'
import type { StoreEntity } from './spinestack-store'
import type { TagEntity } from './spinestack-tag'

export interface SearchObject {
  books: BookEntity[]
  publishers: PublisherEntity[]
  stores: StoreEntity[]
  series: SeriesEntity[]
  people: PersonEntity[]
  tags: TagEntity[]
  collections: CollectionEntity[]
}
