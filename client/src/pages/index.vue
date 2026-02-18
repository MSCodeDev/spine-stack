<script lang="ts" setup>
import {
  ArrowDownOnSquareIcon,
  BookOpenIcon,
  BookmarkIcon,
  PlusIcon,
  QueueListIcon,
} from '@heroicons/vue/24/outline'
import Button from '@/components/form/Button.vue'
import type { Sort } from '@/types/spinestack-api'
import type { BookSort } from '@/types/spinestack-book'

const { t } = useI18n()
const libraryStore = useLibraryStore()
const libraryId = computed(() => libraryStore.library?.id)
const notificator = useToaster()

useHead({ title: () => t('dashboard.title') })

const recentBooksSort = computed<Sort<BookSort>[]>(() => [
  { property: 'createdAt', direction: 'desc' },
])

const { data: recentBooks, isLoading: isLoadingRecentBooks } = useLibraryBooksQuery({
  libraryId,
  includes: ['cover_art'],
  page: ref(0),
  size: ref(6),
  sort: recentBooksSort,
  enabled: computed(() => !!libraryId.value),
  onError: async (error) => {
    await notificator.failure({
      title: t('dashboard.fetch-failure'),
      body: error.message,
    })
  },
})

const { data: allBooks } = useLibraryBooksQuery({
  libraryId,
  page: ref(0),
  size: ref(1),
  enabled: computed(() => !!libraryId.value),
})

const { data: collections } = useLibraryCollectionsQuery({
  libraryId,
  page: ref(0),
  size: ref(1),
  enabled: computed(() => !!libraryId.value),
})

const { data: people } = useLibraryPeopleQuery({
  libraryId,
  page: ref(0),
  size: ref(1),
  enabled: computed(() => !!libraryId.value),
})

const { data: series } = useLibrarySeriesQuery({
  libraryId,
  page: ref(0),
  size: ref(1),
  enabled: computed(() => !!libraryId.value),
})

const totalBooks = computed(() => allBooks.value?.pagination?.totalElements ?? 0)
const totalCollections = computed(() => collections.value?.pagination?.totalElements ?? 0)
const totalAuthors = computed(() => people.value?.pagination?.totalElements ?? 0)
const totalCollectionsAndAuthors = computed(() => totalCollections.value + totalAuthors.value)
const totalSeries = computed(() => series.value?.pagination?.totalElements ?? 0)

const hasBooks = computed(() => totalBooks.value > 0)
</script>

<route lang="yaml">
meta:
  layout: dashboard
</route>

<template>
  <div>
    <Header :title="$t('dashboard.title')">
      <template #actions>
        <Toolbar class="flex gap-2">
          <Button
            class="w-11 h-11"
            is-router-link
            size="small"
            :to="{ name: 'import-search' }"
            :title="$t('common-actions.import')"
          >
            <span class="sr-only">{{ $t('common-actions.import') }}</span>
            <ArrowDownOnSquareIcon class="w-5 h-5" />
          </Button>
          <Button
            kind="primary"
            is-router-link
            :to="{ name: 'books-new' }"
          >
            <PlusIcon class="w-5 h-5" />
            <span>{{ $t('books.new') }}</span>
          </Button>
        </Toolbar>
      </template>
    </Header>

    <div class="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <!-- Quick Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatisticCard
          :title="$t('dashboard.total-books')"
          :value="totalBooks"
          unit="count"
        >
          <template #icon>
            <BookOpenIcon class="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </template>
        </StatisticCard>

        <StatisticCard
          :title="$t('dashboard.collections')"
          :value="totalCollectionsAndAuthors"
          unit="count"
        >
          <template #icon>
            <BookmarkIcon class="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </template>
        </StatisticCard>

        <StatisticCard
          :title="$t('dashboard.total-series')"
          :value="totalSeries"
          unit="count"
        >
          <template #icon>
            <QueueListIcon class="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </template>
        </StatisticCard>
      </div>

      <!-- Recent Books -->
      <Block :title="$t('dashboard.recent-books')">
        <template v-if="hasBooks">
          <div class="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
            <BookCard
              v-for="book in recentBooks?.data"
              :key="book.id"
              :book="book"
              :loading="isLoadingRecentBooks"
              mode="comfortable"
            />
          </div>
          <div class="mt-4 flex justify-end">
            <Button
              is-router-link
              :to="{ name: 'books' }"
              size="small"
            >
              {{ $t('dashboard.view-all-books') }}
            </Button>
          </div>
        </template>

        <EmptyState
          v-else
          :icon="BookmarkIcon"
          :title="$t('dashboard.no-books-title')"
          :description="$t('dashboard.no-books-description')"
        >
          <template #actions>
            <div class="flex gap-2">
              <Button
                is-router-link
                :to="{ name: 'import-search' }"
              >
                <ArrowDownOnSquareIcon class="w-5 h-5" />
                <span>{{ $t('common-actions.import') }}</span>
              </Button>
              <Button
                kind="primary"
                is-router-link
                :to="{ name: 'books-new' }"
              >
                <PlusIcon class="w-5 h-5" />
                <span>{{ $t('books.new') }}</span>
              </Button>
            </div>
          </template>
        </EmptyState>
      </Block>
    </div>
  </div>
</template>
