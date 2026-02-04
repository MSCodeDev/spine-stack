import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { setMyPreferencesValuesByKeys } from '@/services/spinestack-preferences'
import type { Preferences } from '@/types/spinestack-preference'

type ErrorResponse = SpineStackApiError | Error

export default function useSetPreferencesMutation() {
  const queryClient = useQueryClient()

  return useMutation<Preferences, ErrorResponse, Preferences>({
    mutationFn: async (preferences: Preferences) => {
      const persisted = await setMyPreferencesValuesByKeys(preferences)

      return Object.fromEntries(
        persisted.map(({ attributes }) => [attributes.key, attributes.value]),
      )
    },
    onSuccess(_, preferences) {
      queryClient.setQueryData<Preferences>(['preferences'], old => ({
        ...old,
        ...preferences,
      }))
    },
  })
}
