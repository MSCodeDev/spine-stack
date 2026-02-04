<script lang="ts" setup>
import { Dialog as HeadlessUiDialog, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/20/solid'
import { useBarcodeScanner } from '@/composables/useBarcodeScanner'

export interface BarcodeScannerDialogProps {
  isOpen: boolean
}

export interface BarcodeScannerDialogEmits {
  (e: 'close'): void
  (e: 'detected', barcode: string): void
}

const props = defineProps<BarcodeScannerDialogProps>()
const emit = defineEmits<BarcodeScannerDialogEmits>()

const { isOpen } = toRefs(props)
const { t } = useI18n()

const scannerId = 'barcode-scanner-reader'

const {
  isScanning,
  isInitializing,
  detectedCode,
  error,
  start,
  stop,
} = useBarcodeScanner({
  onDetected: (barcode) => {
    setTimeout(async () => {
      await stop()
      emit('detected', barcode)
      emit('close')
    }, 500)
  },
})

watch(isOpen, async (open) => {
  if (open) {
    await nextTick()
    setTimeout(() => start(scannerId), 100)
  } else {
    await stop()
  }
})

async function handleClose() {
  await stop()
  emit('close')
}

async function handleRetry() {
  await stop()
  await nextTick()
  setTimeout(() => start(scannerId), 100)
}

onUnmounted(() => {
  stop()
})
</script>

<template>
  <TransitionRoot
    appear
    as="template"
    :show="isOpen"
  >
    <HeadlessUiDialog
      static
      :open="isOpen"
      @close="handleClose"
    >
      <div class="fixed z-30 inset-0 flex flex-col items-center justify-center p-4">
        <TransitionChild
          as="template"
          enter="motion-safe:transition-opacity duration-200 ease-in-out-primer"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="motion-safe:transition-opacity duration-50 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div
            class="fixed inset-0 bg-gray-950/90 motion-safe:transition-opacity"
            @click="handleClose"
          />
        </TransitionChild>

        <TransitionChild
          as="div"
          class="relative flex flex-col w-full max-w-lg will-change-transform overflow-hidden text-left bg-gray-900 shadow-xl rounded-lg ring-1 ring-white/10"
          enter="motion-reduce:transition-none duration-200 ease-in-out-primer"
          enter-from="opacity-0 scale-75"
          enter-to="opacity-100 scale-100"
          leave="motion-reduce:transition-none duration-50 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <DialogTitle class="text-lg font-medium text-white">
              {{ t('barcode-scanner.title') }}
            </DialogTitle>
            <Button
              class="w-9 h-9 -mr-1"
              kind="ghost-alt"
              :title="t('common-actions.close')"
              @click="handleClose"
            >
              <span class="sr-only">{{ t('common-actions.close') }}</span>
              <XMarkIcon class="w-5 h-5 text-gray-300" />
            </Button>
          </div>

          <!-- Body -->
          <div class="relative bg-black min-h-[350px]">
            <!-- Error message -->
            <div
              v-if="error"
              class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
            >
              <div class="w-16 h-16 mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <XMarkIcon class="w-8 h-8 text-red-400" />
              </div>
              <p class="text-white font-medium mb-2">
                {{ t('barcode-scanner.error') }}
              </p>
              <p class="text-gray-400 text-sm mb-4">
                {{ error }}
              </p>
              <Button
                kind="primary"
                @click="handleRetry"
              >
                {{ t('barcode-scanner.retry') }}
              </Button>
            </div>

            <!-- Scanner container - Quagga renders video and canvas here -->
            <div
              v-show="!error"
              :id="scannerId"
              class="scanner-container w-full h-full"
            />

            <!-- Loading overlay -->
            <div
              v-if="isInitializing && !error"
              class="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80"
            >
              <LoadingSpinIcon class="w-8 h-8 text-primary-500 animate-spin" />
              <p class="text-gray-300 mt-3 text-sm">
                {{ t('barcode-scanner.initializing') }}
              </p>
            </div>

            <!-- Detected code indicator -->
            <div
              v-if="detectedCode"
              class="absolute inset-0 flex items-center justify-center bg-green-500/20 pointer-events-none"
            >
              <div class="bg-green-500 text-white px-4 py-2 rounded-lg font-mono text-lg">
                {{ detectedCode }}
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-4 py-3 border-t border-gray-700 text-center">
            <p class="text-gray-400 text-sm">
              {{ t('barcode-scanner.instructions') }}
            </p>
          </div>
        </TransitionChild>
      </div>
    </HeadlessUiDialog>
  </TransitionRoot>
</template>

<style>
.scanner-container {
  position: relative;
}

.scanner-container video,
.scanner-container canvas {
  width: 100% !important;
  height: auto !important;
}

.scanner-container canvas.drawingBuffer {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
