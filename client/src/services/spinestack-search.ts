import { isAxiosError } from 'axios'
import qs from 'qs'
import { api } from '@/modules/api'
import type { ErrorResponse, ObjectResponse } from '@/types/spinestack-response'
import { SpineStackApiError } from '@/types/spinestack-response'
import type { SearchObject } from '@/types/spinestack-search'

type SearchOnly = ObjectResponse<SearchObject>

export interface SearchParameters {
  libraryId: string
  search: string
}

export async function search(options: SearchParameters): Promise<SearchObject> {
  const { libraryId, search } = options

  try {
    const { data: searchResponse } = await api.get<SearchOnly>(`libraries/${libraryId}/search`, {
      paramsSerializer: params => qs.stringify(params, { indices: false }),
      params: { search },
    })

    return searchResponse.data
  } catch (e) {
    if (isAxiosError<ErrorResponse>(e) && e.response?.data) {
      throw new SpineStackApiError(e.response.data)
    }

    throw e
  }
}
