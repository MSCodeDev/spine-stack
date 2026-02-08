<script lang="ts" setup>
import { MagnifyingGlassIcon } from '@heroicons/vue/20/solid'
import { BookOpenIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline'
import type { ExternalBookEntity } from '@/types/spinestack-external-book'
import type { ImporterSources } from '@/types/spinestack-importer-source'

export interface CoverSearchDialogProps {
  isOpen: boolean
  initialTitle?: string
}

export interface CoverSearchDialogEmits {
  (e: 'close'): void
  (e: 'select', coverUrl: string): void
}

const props = withDefaults(defineProps<CoverSearchDialogProps>(), {
  initialTitle: '',
})

const emit = defineEmits<CoverSearchDialogEmits>()

const { isOpen, initialTitle } = toRefs(props)
const { t, locale } = useI18n()
const notificator = useToaster()

const searchQuery = ref('')
const searchQueryDebounced = refDebounced(searchQuery, 1_000)
const sources = ref<ImporterSources[] | undefined>()

watch(isOpen, (open) => {
  if (open) {
    searchQuery.value = initialTitle.value
  }
})

const { data: results, isFetching } = useImporterQuerySearchQuery({
  title: searchQueryDebounced,
  author: computed(() => ''),
  language: locale,
  sources,
  includes: ['importer_source'],
  enabled: computed(() => {
    return isOpen.value && searchQueryDebounced.value.length >= 2
  }),
  onError: async (error) => {
    await notificator.failure({
      title: t('cover-search.fetch-failure'),
      body: error.message,
    })
  },
})

const resultsWithCovers = computed(() => {
  return (results.value ?? []).filter(book => book.attributes.coverUrl && book.attributes.coverUrl.length > 0)
})

function handleSelectCover(book: ExternalBookEntity) {
  if (book.attributes.coverUrl) {
    emit('select', book.attributes.coverUrl)
    emit('close')
  }
}
</script>

<template>
  <Dialog
    :is-open="isOpen"
    :title="$t('cover-search.title')"
    :description="$t('cover-search.description')"
    dialog-class="max-w-4xl"
    @close="$emit('close')"
  >
    <template #footer>
      <Button
        type="button"
        kind="ghost"
        @click="$emit('close')"
      >
        {{ $t('common-actions.close') }}
      </Button>
    </template>

    <div class="space-y-6">
      <!-- Search Input -->
      <BasicTextInput
        id="cover-search-query"
        v-model="searchQuery"
        :label-text="$t('cover-search.search-label')"
        :placeholder="$t('cover-search.search-placeholder')"
      >
        <template #left-icon>
          <MagnifyingGlassIcon class="w-5 h-5 text-gray-400" />
        </template>
      </BasicTextInput>

      <!-- Loading State -->
      <div v-if="isFetching" class="flex justify-center py-8">
        <LoadingIndicator class="w-8 h-8" />
      </div>

      <!-- No Results -->
      <div
        v-else-if="searchQueryDebounced.length >= 2 && resultsWithCovers.length === 0"
        class="text-center py-8"
      >
        <ExclamationCircleIcon class="w-12 h-12 text-gray-400 mx-auto" />
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          {{ $t('cover-search.no-results') }}
        </p>
      </div>

      <!-- Results Grid -->
      <div v-else-if="resultsWithCovers.length > 0" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
        <button
          v-for="book in resultsWithCovers"
          :key="book.id"
          type="button"
          class="group relative rounded-lg overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
          @click="handleSelectCover(book)"
        >
          <div class="aspect-[2/3] bg-gray-100 dark:bg-gray-800">
            <img
              :src="book.attributes.coverUrl"
              :alt="book.attributes.title"
              class="w-full h-full object-cover"
            >
          </div>
          <div
            class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity flex items-center justify-center"
          >
            <span class="text-white text-sm font-medium px-2 text-center line-clamp-3">
              {{ book.attributes.title }}
            </span>
          </div>
          <div
            class="absolute inset-0 ring-2 ring-primary-500 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity rounded-lg pointer-events-none"
          />
        </button>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-8"
      >
        <BookOpenIcon class="w-12 h-12 text-gray-400 mx-auto" />
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          {{ $t('cover-search.empty-state') }}
        </p>
      </div>
    </div>
  </Dialog>
</template>
