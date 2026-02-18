<script lang="ts" setup>
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/vue/20/solid'
import { ArchiveBoxIcon, MagnifyingGlassIcon as MagnifyingGlassIconOutline } from '@heroicons/vue/24/outline'
import type { CollectionCreation } from '@/types/spinestack-collection'

const { t } = useI18n()
const router = useRouter()
const notificator = useToaster()

const showCreateDialog = ref(false)
const search = ref('')
const searchTerm = refDebounced(search, 500)

const { mutate } = useCreateCollectionMutation()

const libraryStore = useLibraryStore()
const library = computed(() => libraryStore.library!)

function handleCreateCollection(collection: CollectionCreation) {
  mutate(collection, {
    onSuccess: async ({ id }) => {
      notificator.success({ title: t('collections.created-with-success') })
      await router.push({ name: 'collections-id', params: { id } })
    },
    onError: async (error) => {
      await notificator.failure({
        title: t('collections.created-with-failure'),
        body: error.message,
      })
    },
  })
}
</script>

<route lang="yaml">
meta:
  layout: dashboard
</route>

<template>
  <div>
    <Header
      class="mb-3 md:mb-0"
      :title="$t('entities.collections')"
    >
      <template #actions>
        <Button
          kind="primary"
          @click="showCreateDialog = true"
        >
          <PlusIcon class="w-5 h-5" />
          <span>{{ $t('collections.new') }}</span>
        </Button>
      </template>
    </Header>

    <div class="max-w-7xl mx-auto p-4 sm:p-6">
      <h2 class="text-md sm:text-lg font-medium font-display dark:text-gray-100 mb-4">
        {{ $t('collections.manual-collections') }}
      </h2>

      <CollectionsTable
        v-if="library"
        :library-id="library.id"
        :search="searchTerm"
      >
        <template #empty>
          <EmptyState
            :icon="searchTerm.length > 0 ? MagnifyingGlassIconOutline : ArchiveBoxIcon"
            :title="$t('collections.empty-header')"
            :description="
              searchTerm.length > 0
                ? $t('collections.empty-search-description', [searchTerm])
                : $t('collections.empty-description')
            "
          >
            <template v-if="searchTerm.length === 0" #actions>
              <Button
                kind="primary"
                @click="showCreateDialog = true"
              >
                <PlusIcon class="w-5 h-5" />
                <span>{{ $t('collections.new') }}</span>
              </Button>
            </template>
          </EmptyState>
        </template>
      </CollectionsTable>

      <AuthorCollections
        v-if="library"
        :library-id="library.id"
      />
    </div>

    <CollectionCreateDialog
      v-if="library"
      :library-id="library.id"
      :is-open="showCreateDialog"
      @submit="handleCreateCollection"
      @close="showCreateDialog = false"
    />
  </div>
</template>
