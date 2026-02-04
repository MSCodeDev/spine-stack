import { isAxiosError } from 'axios'
import { api } from '@/modules/api'
import { type ErrorResponse, SpineStackApiError } from '@/types/spinestack-response'
import type {
  PreferenceCollectionResponse,
  PreferenceEntity,
  Preferences,
} from '@/types/spinestack-preference'

export async function getMyPreferences(): Promise<PreferenceEntity[]> {
  try {
    const { data: me } = await api.get<PreferenceCollectionResponse>('users/me/preferences')

    return me.data
  } catch (e) {
    if (isAxiosError<ErrorResponse>(e) && e.response?.data) {
      throw new SpineStackApiError(e.response.data)
    }

    throw e
  }
}

export async function setMyPreferencesValuesByKeys(preferences: Preferences) {
  try {
    const { data } = await api.post<PreferenceCollectionResponse>(
      'users/me/preferences/batch',
      preferences,
    )

    return data.data
  } catch (e) {
    if (isAxiosError<ErrorResponse>(e) && e.response?.data) {
      throw new SpineStackApiError(e.response.data)
    }

    throw e
  }
}
