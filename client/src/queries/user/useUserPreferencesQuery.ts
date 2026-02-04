import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import { getMyPreferences } from '@/services/spinestack-preferences'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { Preferences } from '@/types/spinestack-preference'

type ErrorResponse = SpineStackApiError | Error

export default function useUserPreferencesQuery<Select = Preferences>(
  options?: UseQueryOptions<Preferences, ErrorResponse, Select>,
) {
  return useQuery<Preferences, ErrorResponse, Select>({
    queryKey: ['preferences'],
    queryFn: async () => {
      try {
        const preferences = await getMyPreferences()

        return Object.fromEntries(
          preferences.map(({ attributes }) => [attributes.key, attributes.value]),
        )
      } catch (_) {
        return {}
      }
    },
    ...options,
  })
}
