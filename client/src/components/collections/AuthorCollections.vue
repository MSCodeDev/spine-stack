<script lang="ts" setup>
import { ArrowTopRightOnSquareIcon } from '@heroicons/vue/20/solid'
import { PaintBrushIcon, UserGroupIcon } from '@heroicons/vue/24/outline'
import { PaintBrushIcon as PaintBrushSolidIcon } from '@heroicons/vue/24/solid'
import Avatar from '../Avatar.vue'
import Button from '@/components/form/Button.vue'
import { getRelationship } from '@/utils/api'
import { createImageUrl } from '@/modules/api'
import { getAllBooksByPerson } from '@/services/spinestack-books'
import type { PersonEntity } from '@/types/spinestack-person'

export interface AuthorCollectionsProps {
  libraryId: string
}

const props = defineProps<AuthorCollectionsProps>()

const { t } = useI18n()
const notificator = useToaster()

const { data: people, isLoading } = useLibraryPeopleQuery({
  libraryId: computed(() => props.libraryId),
  includes: ['person_picture'],
  unpaged: ref(true),
  enabled: computed(() => !!props.libraryId),
  onError: async (error: Error) => {
    await notificator.failure({
      title: t('people.fetch-failure'),
      body: error.message,
    })
  },
})

const authors = computed<PersonEntity[]>(() => {
  if (!people.value) {
    return []
  }

  return 'data' in people.value ? people.value.data : []
})

const bookCounts = ref<Record<string, number>>({})

watch(authors, async (newAuthors) => {
  if (newAuthors.length === 0) {
    return
  }

  const counts: Record<string, number> = {}

  await Promise.all(
    newAuthors.map(async (person) => {
      try {
        const result = await getAllBooksByPerson({
          personId: person.id,
          page: 0,
          size: 1,
        })
        counts[person.id] = result.pagination.totalElements
      } catch {
        counts[person.id] = 0
      }
    }),
  )

  bookCounts.value = counts
}, { immediate: true })

function getPictureUrl(person: PersonEntity) {
  const picture = getRelationship(person, 'PERSON_PICTURE')

  return createImageUrl({
    fileName: picture?.attributes?.versions?.['64'],
    timeHex: picture?.attributes?.timeHex,
  })
}
</script>

<template>
  <section v-if="isLoading || authors.length > 0" class="mt-8">
    <h2 class="text-md sm:text-lg font-medium font-display dark:text-gray-100 mb-4">
      {{ $t('collections.author-collections') }}
    </h2>

    <div class="overflow-hidden sm:rounded-lg border border-gray-200 dark:border-gray-800 relative">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-800">
            <th class="py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 text-left dark:bg-gray-900">
              {{ $t('common-fields.name') }}
            </th>
            <th class="py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 text-left dark:bg-gray-900">
              {{ $t('collections.author-collections-book-count') }}
            </th>
            <th class="py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 text-left dark:bg-gray-900 w-12" />
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
          <template v-if="isLoading">
            <tr v-for="i in 4" :key="i" class="group">
              <td class="px-4 py-2">
                <div class="flex items-center space-x-3">
                  <div class="skeleton w-10 h-10 rounded-lg" />
                  <div class="skeleton w-32 h-4 rounded" />
                </div>
              </td>
              <td class="px-4 py-2">
                <div class="skeleton w-24 h-4 rounded" />
              </td>
              <td class="px-4 py-2">
                <div class="skeleton w-10 h-10 rounded" />
              </td>
            </tr>
          </template>
          <template v-else-if="authors.length > 0">
            <tr
              v-for="person in authors"
              :key="person.id"
              class="group"
            >
              <td class="px-4 py-2 text-sm dark:text-gray-300 dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/80">
                <div class="flex items-center space-x-3">
                  <Avatar
                    square
                    :empty-icon="PaintBrushSolidIcon"
                    :picture-url="getPictureUrl(person)"
                  />
                  <div class="flex flex-col">
                    <span class="font-medium" :title="person.attributes.name">
                      {{ person.attributes.name }}
                    </span>
                    <span
                      v-if="person.attributes.nativeName.name.length"
                      :lang="person.attributes.nativeName.language ?? undefined"
                      class="text-xs text-gray-700 dark:text-gray-400"
                    >
                      {{ person.attributes.nativeName.name }}
                    </span>
                  </div>
                </div>
              </td>
              <td class="px-4 py-2 text-sm tabular-nums dark:text-gray-300 dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/80">
                {{ bookCounts[person.id] ?? '—' }}
              </td>
              <td class="px-4 py-2 text-sm dark:text-gray-300 dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/80">
                <Button
                  kind="ghost-alt"
                  is-router-link
                  class="w-10 h-10"
                  :to="{ name: 'people-id', params: { id: person.id } }"
                >
                  <span class="sr-only">{{ $t('common-actions.view-details') }}</span>
                  <ArrowTopRightOnSquareIcon class="w-5 h-5" />
                </Button>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="3">
              <EmptyState
                :icon="UserGroupIcon"
                :title="$t('collections.author-collections-empty')"
                :description="$t('collections.author-collections-empty-description')"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
