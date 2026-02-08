<script setup lang="ts">
import useVuelidate from '@vuelidate/core'
import { helpers } from '@vuelidate/validators'
import { MagnifyingGlassIcon, TrashIcon } from '@heroicons/vue/20/solid'
import { BookOpenIcon } from '@heroicons/vue/24/outline'
import { maxFileSize } from '@/utils/validation'
import { ACCEPTED_IMAGE_FORMATS } from '@/utils/api'
import CoverSearchDialog from './CoverSearchDialog.vue'

export interface BookCoverArtFormProps {
  currentImageUrl?: string | undefined | null
  coverArt: CoverArt
  disabled?: boolean
  title?: string
}

export interface CoverArt {
  removeExisting: boolean
  file: File | null
  externalUrl?: string | null
}

export interface BookCoverArtFormEmits {
  (e: 'update:cover-art', coverArt: CoverArt): void
}

const props = withDefaults(defineProps<BookCoverArtFormProps>(), {
  currentImageUrl: undefined,
  disabled: false,
  title: '',
})

const emit = defineEmits<BookCoverArtFormEmits>()

const { coverArt, currentImageUrl, title } = toRefs(props)

const { t } = useI18n()

const showCoverSearchDialog = ref(false)

const rules = computed(() => {
  const messageMaxFileSize = helpers.withMessage(
    ({ $params }) => t('validation.max-size', [$params.sizeString]),
    maxFileSize(5 * 1_024 * 1_024, '5MB'),
  )

  return { coverArt: { file: { messageMaxFileSize } } }
})

const v$ = useVuelidate(rules, { coverArt })

defineExpose({ v$ })

const uploadingBlobUrl = computed(() => {
  if (!coverArt.value.file || v$.value.coverArt.file.$error) {
    return null
  }

  return URL.createObjectURL(coverArt.value.file)
})

function handleUpload(files: FileList) {
  const copy = structuredClone(toRaw(coverArt.value))
  copy.file = files[0]
  copy.externalUrl = null

  emit('update:cover-art', copy)
  v$.value.coverArt.file.$touch()
}

function handleRemove() {
  const copy = structuredClone(toRaw(coverArt.value))

  if (uploadingBlobUrl.value || copy.externalUrl) {
    copy.file = null
    copy.externalUrl = null
  } else if (currentImageUrl.value) {
    copy.removeExisting = true
  }

  emit('update:cover-art', copy)
}

function handleCoverSelected(coverUrl: string) {
  const copy = structuredClone(toRaw(coverArt.value))
  copy.externalUrl = coverUrl
  copy.file = null
  copy.removeExisting = false

  emit('update:cover-art', copy)
}

const previewUrl = computed(() => {
  if (coverArt.value.externalUrl) {
    return coverArt.value.externalUrl
  }
  return coverArt.value.removeExisting ? null : currentImageUrl.value
})
</script>

<template>
  <fieldset :disabled="disabled" class="grid grid-cols-1 sm:grid-cols-4 xl:grid-cols-5 gap-4">
    <div class="flex flex-col items-center gap-4">
      <FadeTransition>
        <div
          v-if="!uploadingBlobUrl && !previewUrl"
          :class="[
            'w-2/3 sm:w-full aspect-[2/3] flex items-center justify-center',
            'bg-gray-200 dark:bg-gray-800 rounded-xl shadow-md',
          ]"
        >
          <BookOpenIcon class="w-10 h-10 text-gray-500 dark:text-gray-600" />
        </div>
        <img
          v-else
          :src="uploadingBlobUrl ?? previewUrl ?? undefined"
          class="w-2/3 sm:w-full rounded-xl shadow-md ring-1 ring-black/5"
        >
      </FadeTransition>
      <div class="flex flex-col gap-2 w-fit sm:w-full">
        <Button
          type="button"
          class="w-full"
          @click="showCoverSearchDialog = true"
        >
          <MagnifyingGlassIcon class="w-5 h-5" />
          <span>{{ $t('cover-search.search-online') }}</span>
        </Button>
        <Button
          type="button"
          class="w-full"
          :disabled="!previewUrl && !uploadingBlobUrl"
          @click="handleRemove"
        >
          <TrashIcon class="w-5 h-5" />
          <span>{{ $t('common-actions.remove') }}</span>
        </Button>
      </div>
    </div>
    <div class="sm:col-span-3 xl:col-span-4">
      <FileInput
        id="cover-art"
        class="h-48"
        :accept="ACCEPTED_IMAGE_FORMATS"
        :invalid="v$.coverArt.file.$error"
        :errors="v$.coverArt.file.$errors"
        @change="handleUpload"
      />
    </div>
  </fieldset>

  <CoverSearchDialog
    :is-open="showCoverSearchDialog"
    :initial-title="title"
    @close="showCoverSearchDialog = false"
    @select="handleCoverSelected"
  />
</template>
