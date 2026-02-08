<script lang="ts" setup>
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import useVuelidate from '@vuelidate/core'
import { helpers } from '@vuelidate/validators'
import { FunnelIcon } from '@heroicons/vue/20/solid'
import type { ExternalBookEntity } from '@/types/spinestack-external-book'
import type { ImportOneBook, ImporterSources } from '@/types/spinestack-importer-source'
import { isbn as isValidIsbn } from '@/utils/validation'

const { t, locale } = useI18n()
const router = useRouter()
const notificator = useToaster()

type SearchMode = 'isbn' | 'title' | 'author'

const searchModeOptions = computed(() => [
  { value: 'isbn', label: t('common-fields.isbn') },
  { value: 'title', label: t('common-fields.title') },
  { value: 'author', label: t('common-fields.author') },
])

const searchMode = ref<SearchMode>('isbn')
const isbn = ref('')
const isbnDebounced = refDebounced(isbn, 1_000)
const title = ref('')
const titleDebounced = refDebounced(title, 1_000)
const author = ref('')
const authorDebounced = refDebounced(author, 1_000)
const sources = ref<ImporterSources[] | undefined>()
const bookToImport = ref<ExternalBookEntity | undefined>()
const showBarcodeScanner = ref(false)

const rules = {
  isbn: {
    isbn: helpers.withMessage(t('validation.isbn'), isValidIsbn),
  },
}

const v$ = useVuelidate(rules, { isbn })

watch(isbn, (value) => {
  if (value.length < 10) {
    v$.value.$reset()
    bookToImport.value = undefined
  } else {
    v$.value.$touch()
  }
})

watch(searchMode, () => {
  // Reset search when switching modes
  isbn.value = ''
  title.value = ''
  author.value = ''
  v$.value.$reset()
  bookToImport.value = undefined
})

const { data: isbnResults, isFetching: isFetchingIsbn } = useImporterSearchQuery({
  isbn: isbnDebounced,
  sources,
  includes: ['importer_source'],
  enabled: computed(() => {
    return searchMode.value === 'isbn' && isbnDebounced.value.length > 0 && !v$.value.$invalid
  }),
  onError: async (error) => {
    await notificator.failure({
      title: t('importer.fetch-failure'),
      body: error.message,
    })
  },
})

const { data: titleResults, isFetching: isFetchingTitle } = useImporterQuerySearchQuery({
  title: titleDebounced,
  author: computed(() => ''),
  language: locale,
  sources,
  includes: ['importer_source'],
  enabled: computed(() => {
    return searchMode.value === 'title' && titleDebounced.value.length >= 2
  }),
  onError: async (error) => {
    await notificator.failure({
      title: t('importer.fetch-failure'),
      body: error.message,
    })
  },
})

const { data: authorResults, isFetching: isFetchingAuthor } = useImporterQuerySearchQuery({
  title: computed(() => ''),
  author: authorDebounced,
  language: locale,
  sources,
  includes: ['importer_source'],
  enabled: computed(() => {
    return searchMode.value === 'author' && authorDebounced.value.length >= 2
  }),
  onError: async (error) => {
    await notificator.failure({
      title: t('importer.fetch-failure'),
      body: error.message,
    })
  },
})

const results = computed(() => {
  switch (searchMode.value) {
    case 'isbn': return isbnResults.value
    case 'title': return titleResults.value
    case 'author': return authorResults.value
  }
})

const isFetching = computed(() => {
  switch (searchMode.value) {
    case 'isbn': return isFetchingIsbn.value
    case 'title': return isFetchingTitle.value
    case 'author': return isFetchingAuthor.value
  }
})

const showCollectionChooserDialog = ref(false)

const { mutate: importBook, isLoading: isImporting } = useImportBookMutation()

function handleResultImportClick(book: ExternalBookEntity) {
  bookToImport.value = book
  showCollectionChooserDialog.value = true
}

function handleImportBook(book: ImportOneBook) {
  importBook(book, {
    onSuccess: async (created) => {
      notificator.success({ title: t('importer.imported-with-success') })
      await router.push({ name: 'books-id', params: { id: created.id } })
    },
    onError: async (error) => {
      await notificator.failure({
        title: t('importer.imported-with-failure'),
        body: error.message,
      })
    },
  })
}

function handleBarcodeDetected(barcode: string) {
  isbn.value = barcode
  showBarcodeScanner.value = false
}
</script>

<route lang="yaml">
meta:
  layout: dashboard
</route>

<template>
  <div>
    <Header :title="$t('importer.header')" />

    <div class="max-w-7xl mx-auto p-4 sm:p-6 space-y-10">
      <!-- Search Controls -->
      <div class="bg-gray-100 dark:bg-block-dark rounded-lg p-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Search Mode Dropdown -->
          <div class="w-full sm:w-48 shrink-0">
            <select
              id="search-mode"
              v-model="searchMode"
              class="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm mt-1"
              :disabled="isFetching || isImporting"
            >
              <option v-for="option in searchModeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- ISBN Input -->
          <div v-if="searchMode === 'isbn'" class="flex-1 flex gap-2">
            <div class="flex-1">
              <label for="isbn" class="sr-only">
                {{ $t('common-fields.isbn') }}
              </label>
              <BasicTextInput
                id="isbn"
                v-model="isbn"
                class="text-lg tabular-nums"
                type="search"
                input-mode="numeric"
                :disabled="isFetching || isImporting"
                :placeholder="$t('common-placeholders.search-by-isbn')"
                :errors="v$.isbn.$errors"
                :invalid="v$.isbn.$error"
              >
                <template #left-icon>
                  <MagnifyingGlassIcon class="w-5 h-5" />
                </template>

                <template v-if="isFetching" #right-icon>
                  <LoadingSpinIcon class="w-5 h-5 text-primary-500 animate-spin" />
                </template>
              </BasicTextInput>

              <p
                v-if="v$.isbn.$error && v$.isbn.$errors[0]?.$message"
                class="text-red-700 dark:text-red-500/95 text-sm font-medium ml-2 mt-1"
              >
                {{ v$.isbn.$errors[0]?.$message }}
              </p>
            </div>

            <Button
              kind="ghost-alt"
              :title="$t('importer.scan-barcode')"
              :disabled="isFetching || isImporting"
              @click="showBarcodeScanner = true"
            >
              <span class="sr-only">{{ $t('importer.scan-barcode') }}</span>
              <BarcodeIcon class="w-5 h-5" />
            </Button>
          </div>

          <!-- Title Input -->
          <div v-if="searchMode === 'title'" class="flex-1">
            <label for="title" class="sr-only">
              {{ $t('common-fields.title') }}
            </label>
            <BasicTextInput
              id="title"
              v-model="title"
              class="text-lg"
              type="search"
              :disabled="isFetching || isImporting"
              :placeholder="$t('importer.title-placeholder')"
            >
              <template #left-icon>
                <MagnifyingGlassIcon class="w-5 h-5" />
              </template>

              <template v-if="isFetching" #right-icon>
                <LoadingSpinIcon class="w-5 h-5 text-primary-500 animate-spin" />
              </template>
            </BasicTextInput>
          </div>

          <!-- Author Input -->
          <div v-if="searchMode === 'author'" class="flex-1">
            <label for="author" class="sr-only">
              {{ $t('common-fields.author') }}
            </label>
            <BasicTextInput
              id="author"
              v-model="author"
              class="text-lg"
              type="search"
              :disabled="isFetching || isImporting"
              :placeholder="$t('importer.author-placeholder')"
            >
              <template #left-icon>
                <MagnifyingGlassIcon class="w-5 h-5" />
              </template>

              <template v-if="isFetching" #right-icon>
                <LoadingSpinIcon class="w-5 h-5 text-primary-500 animate-spin" />
              </template>
            </BasicTextInput>
          </div>
        </div>
      </div>

      <div v-if="results && results.length > 0">
        <h2 class="font-display-safe font-medium text-xl">
          {{ $t('importer.results') }}
        </h2>

        <div class="space-y-8 mt-4 sm:mt-6">
          <ImporterResultCard
            v-for="result in results"
            :key="result.id + result.attributes.isbn"
            :result="result"
            :importing="isImporting && bookToImport?.id === result.id"
            :disabled="isImporting"
            @click:import="handleResultImportClick(result)"
          />
        </div>
      </div>
    </div>

    <ImporterCollectionChooserDialog
      v-if="bookToImport"
      :is-open="showCollectionChooserDialog"
      :external-book="bookToImport"
      @close="showCollectionChooserDialog = false"
      @submit="handleImportBook"
    />

    <BarcodeScannerDialog
      :is-open="showBarcodeScanner"
      @close="showBarcodeScanner = false"
      @detected="handleBarcodeDetected"
    />
  </div>
</template>
