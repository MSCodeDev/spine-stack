export interface EntityResponse<Entity> {
  result: 'OK'
  response: 'ENTITY'
  data: Entity
}

export interface ObjectResponse<Object> {
  result: 'OK'
  response: 'OBJECT'
  data: Object
}

export interface CollectionResponse<Entity> {
  result: 'OK'
  response: 'COLLECTION'
  data: Entity[]
}

export interface PaginatedResponse<Entity> {
  result: 'OK'
  response: 'COLLECTION'
  data: Entity[]
  pagination: Pagination
}

export interface ErrorResponse {
  result: 'ERROR'
  errors: SpineStackError[]
}

export interface SpineStackError {
  id: string
  status: number
  title: string
  details: string
  stackTrace: string | undefined
}

export interface Pagination {
  currentPage: number
  totalElements: number
  totalPages: number
}

export type SpineStackResponse<T> = EntityResponse<T>
| ObjectResponse<T>
| CollectionResponse<T>
| PaginatedResponse<T>
| ErrorResponse

export class SpineStackApiError extends Error {
  errors: SpineStackError[]

  constructor(response: ErrorResponse) {
    super(response.errors[0].title)
    this.errors = response.errors
    Object.setPrototypeOf(this, SpineStackApiError.prototype)
  }
}
