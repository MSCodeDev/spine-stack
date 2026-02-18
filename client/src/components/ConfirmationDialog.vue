<script lang="ts" setup>
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

export interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  description?: string
  confirmText?: string
  kind?: 'danger' | 'normal'
  loading?: boolean
}

withDefaults(defineProps<ConfirmationDialogProps>(), {
  kind: 'danger',
  loading: false,
})

defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <Dialog
    dialog-class="max-w-md"
    :is-open="isOpen"
    :title="title"
    :description="description"
    :full-height="false"
    @close="$emit('close')"
  >
    <div class="flex items-start gap-4">
      <div
        class="shrink-0 flex items-center justify-center w-10 h-10 rounded-full"
        :class="[
          kind === 'danger'
            ? 'bg-red-100 dark:bg-red-950'
            : 'bg-amber-100 dark:bg-amber-950',
        ]"
      >
        <ExclamationTriangleIcon
          class="w-6 h-6"
          :class="[
            kind === 'danger'
              ? 'text-red-600 dark:text-red-400'
              : 'text-amber-600 dark:text-amber-400',
          ]"
        />
      </div>
      <p class="text-sm text-gray-600 dark:text-gray-400 pt-2">
        <slot>{{ $t('confirmation-dialog.default-body') }}</slot>
      </p>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <Button
          kind="normal"
          :disabled="loading"
          @click="$emit('close')"
        >
          {{ $t('confirmation-dialog.cancel') }}
        </Button>
        <Button
          :kind="kind === 'danger' ? 'danger' : 'primary'"
          :loading="loading"
          @click="$emit('confirm')"
        >
          {{ confirmText ?? $t('confirmation-dialog.confirm') }}
        </Button>
      </div>
    </template>
  </Dialog>
</template>
