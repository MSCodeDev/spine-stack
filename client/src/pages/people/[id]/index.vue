<script lang="ts" setup>
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/solid'
import { PaintBrushIcon } from '@heroicons/vue/24/outline'
import { getRelationship } from '@/utils/api'
import type { Sort } from '@/types/spinestack-api'
import type { BookSort } from '@/types/spinestack-book'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const personId = useRouteParams<string | undefined>('id', undefined)
const notificator = useToaster()

const { mutate: deletePerson, isLoading: isDeleting, isSuccess: isDeleted } = useDeletePersonMutation()
const showDeleteDialog = ref(false)

const queryEnabled = computed(() => {
  return !!personId.value && !isDeleting.value && !isDeleted.value && route.name === 'people-id'
})

const { data: person, isLoading } = usePersonQuery({
  personId: personId as Ref<string>,
  includes: ['library', 'person_picture'],
  enabled: queryEnabled,
  onError: async (error) => {
    await notificator.failure({
      title: t('people.fetch-one-failure'),
      body: error.message,
    })
  },
})

const sort = ref<Sort<BookSort> | null>({ property: 'number', direction: 'asc' })

const { data: books, isLoading: isLoadingBooks } = usePersonBooksQuery({
  personId: personId as Ref<string>,
  includes: ['cover_art', 'collection', 'series', 'publisher'],
  sort: computed(() => sort.value ? [sort.value] : undefined),
  enabled: computed(() => queryEnabled.value && !!person.value?.id),
  keepPreviousData: true,
  onError: async (error) => {
    await notificator.failure({
      title: t('books.fetch-failure'),
      body: error.message,
    })
  },
})

function handleDelete() {
  deletePerson(personId.value!, {
    onSuccess: async () => {
      notificator.success({ title: t('people.deleted-with-success') })
      await router.replace({ name: 'people' })
    },
    onError: async (error) => {
      await notificator.failure({
        title: t('people.deleted-with-failure'),
        body: error.message,
      })
    },
  })
}

useHead({ title: () => person.value?.attributes.name ?? '' })
</script>

<template>
  <div
    :class="[
      'bg-white dark:bg-gray-950 motion-safe:transition-colors',
      'duration-300 ease-in-out -mt-16 relative',
    ]"
  >
    <div class="absolute inset-x-0 top-0">
      <ImageBanner
        class="!h-52"
        :alt="person?.attributes.name ?? ''"
        :loading="isLoading"
        :image="getRelationship(person, 'PERSON_PICTURE')?.attributes"
        size="64"
        kind="repeated"
      />
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 z-10 pt-20 pb-6 relative">
      <div class="person-grid">
        <ImageCover
          class="person-picture"
          version="256"
          aspect-ratio="1 / 1"
          :icon="PaintBrushIcon"
          :loading="isLoading"
          :image="getRelationship(person, 'PERSON_PICTURE')?.attributes"
          :alt="person?.attributes.name ?? ''"
        >
          <Flag
            v-if="!isLoading"
            :region="person?.attributes.nationality"
            :class="[
              'inline-block z-10',
              'absolute right-1.5 sm:right-3 bottom-1.5 sm:bottom-3',
              'pointer-events-none',
            ]"
          />
        </ImageCover>

        <PersonName
          class="person-name"
          :loading="isLoading"
          :person="person"
        />

        <div class="person-buttons pt-1.5 flex items-center justify-end">
          <div
            v-if="isLoading"
            class="flex justify-center sm:justify-start items-center gap-2"
          >
            <div class="skeleton w-12 h-12" />
            <div class="skeleton w-12 h-12" />
          </div>
          <Toolbar v-else class="flex justify-center sm:justify-start items-center gap-2">
            <Button
              class="aspect-1"
              size="small"
              is-router-link
              :to="{ name: 'people-id-edit', params: { id: person?.id } }"
              :disabled="isDeleting"
              :title="$t('common-actions.edit')"
            >
              <span class="sr-only">{{ $t('common-actions.edit') }}</span>
              <PencilIcon class="w-5 h-5" />
            </Button>

            <Button
              class="aspect-1"
              size="small"
              :loading="isDeleting"
              :title="$t('common-actions.delete')"
              @click="showDeleteDialog = true"
            >
              <span class="sr-only">{{ $t('common-actions.delete') }}</span>
              <TrashIcon class="w-5 h-5" />
            </Button>
          </Toolbar>
        </div>

        <div class="person-content flex flex-col gap-4 sm:gap-6">
          <BlockMarkdown
            :loading="isLoading"
            :markdown="person?.attributes?.description"
            :title="$t('common-fields.description')"
          />

          <EntityExternalLinks
            :links="(person?.attributes?.links as Record<string, string | null> | undefined)"
            :loading="isLoading"
          />

          <BooksListViewer
              v-model:sort="sort"
              :with-controls="false"
              column-order-key="person_books_column_order"
              column-visibility-key="person_books_column_visibility"
              view-mode-key="person_books_view_mode"
              :books="books"
              :default-column-order="['title', 'collection', 'boughtAt']"
              :default-column-visibility="{
                collection: true,
                series: false,
                createdAt: false,
                modifiedAt: false,
                boughtAt: true,
                billedAt: false,
                arrivedAt: false,
                weight: false,
                publishers: false,
                title: true,
                number: false,
                pageCount: false,
              }"
              :loading="isLoadingBooks || isLoading"
              :with-search="false"
            />
        </div>

        <div class="person-attributes">
          <PersonAttributes
            class="sm:sticky sm:top-24"
            :loading="isLoading"
            :person="person"
          />
        </div>
      </div>
    </div>

    <ConfirmationDialog
      :is-open="showDeleteDialog"
      :title="$t('confirmation-dialog.delete-title', [$t('entities.person')])"
      :confirm-text="$t('common-actions.delete')"
      :loading="isDeleting"
      @close="showDeleteDialog = false"
      @confirm="handleDelete"
    >
      {{ $t('confirmation-dialog.delete-body', [$t('entities.person').toLowerCase()]) }}
    </ConfirmationDialog>
  </div>
</template>

<route lang="yaml">
meta:
  layout: dashboard
  transparentNavbar: true
</route>

<style lang="postcss">
.person-grid {
  display: grid;
  gap: 1rem;
  grid-template-areas:
    'picture name'
    'buttons buttons'
    'content content'
    'attributes attributes';
  grid-template-columns: 6rem 1fr;

  @media (min-width: theme('screens.sm')) {
    gap: 1.5rem;
    grid-template-areas:
      'picture name'
      'picture buttons'
      'picture padding'
      'attributes content';
    grid-template-columns: 12rem 1fr;
  }

  .person-picture {
    grid-area: picture / picture / picture / picture;
  }

  .person-buttons {
    grid-area: buttons / buttons / buttons / buttons;
  }

  .person-name {
    grid-area: name / name / name / name;
  }

  .person-content {
    grid-area: content / content / content / content;
  }

  .person-attributes {
    grid-area: attributes / attributes / attributes / attributes;
  }
}
</style>
