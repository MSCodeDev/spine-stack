import { ref } from 'vue'
import type { Ref } from 'vue'
import Quagga from '@ericblade/quagga2'

export interface UseBarcodeScannerOptions {
  onDetected?: (barcode: string) => void
  onError?: (error: Error) => void
}

export interface UseBarcodeScannerReturn {
  isScanning: Ref<boolean>
  isInitializing: Ref<boolean>
  detectedCode: Ref<string | null>
  error: Ref<string | null>
  start: (elementId: string) => Promise<void>
  stop: () => Promise<void>
}

export function useBarcodeScanner(options: UseBarcodeScannerOptions = {}): UseBarcodeScannerReturn {
  const { onDetected, onError } = options

  const isScanning = ref(false)
  const isInitializing = ref(false)
  const detectedCode = ref<string | null>(null)
  const error = ref<string | null>(null)

  let lastDetected = ''
  let detectionCount = 0

  async function start(elementId: string) {
    if (isScanning.value || isInitializing.value) {
      return
    }

    error.value = null
    detectedCode.value = null
    lastDetected = ''
    detectionCount = 0
    isInitializing.value = true

    try {
      await new Promise<void>((resolve, reject) => {
        Quagga.init(
          {
            inputStream: {
              name: 'Live',
              type: 'LiveStream',
              target: document.querySelector(`#${elementId}`),
              constraints: {
                facingMode: 'environment',
                width: { min: 640, ideal: 1280, max: 1920 },
                height: { min: 480, ideal: 720, max: 1080 },
              },
            },
            locator: {
              patchSize: 'medium',
              halfSample: true,
            },
            numOfWorkers: navigator.hardwareConcurrency || 4,
            frequency: 10,
            decoder: {
              readers: [
                'ean_reader',
                'ean_8_reader',
                'upc_reader',
                'upc_e_reader',
              ],
            },
            locate: true,
          },
          (err) => {
            if (err) {
              reject(err)
              return
            }
            resolve()
          },
        )
      })

      // Draw detection boxes and lines on canvas
      Quagga.onProcessed((result) => {
        const drawingCtx = Quagga.canvas.ctx.overlay
        const drawingCanvas = Quagga.canvas.dom.overlay

        if (result) {
          // Clear previous drawings
          if (drawingCtx && drawingCanvas) {
            drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height)
          }

          // Draw boxes around detected areas
          if (result.boxes) {
            result.boxes
              .filter((box: any) => box !== result.box)
              .forEach((box: any) => {
                Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
                  color: 'rgba(0, 255, 0, 0.5)',
                  lineWidth: 2,
                })
              })
          }

          // Draw the main detected box in blue
          if (result.box) {
            Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
              color: 'rgba(59, 130, 246, 0.8)',
              lineWidth: 3,
            })
          }

          // Draw the scan line in red when code is found
          if (result.codeResult && result.codeResult.code) {
            Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, {
              color: 'rgba(239, 68, 68, 1)',
              lineWidth: 4,
            })
          }
        }
      })

      Quagga.onDetected((result) => {
        const code = result.codeResult.code
        if (!code) return

        // Check if this is likely a valid ISBN (13 or 10 digits, or EAN-8 with 8 digits)
        const isValidLength = code.length === 13 || code.length === 10 || code.length === 8

        if (!isValidLength) {
          return
        }

        // Accept if same code detected twice for reliability
        if (code === lastDetected) {
          detectionCount++
          if (detectionCount >= 2) {
            detectedCode.value = code
            onDetected?.(code)
            // Reset for next scan
            lastDetected = ''
            detectionCount = 0
          }
        } else {
          lastDetected = code
          detectionCount = 1
        }
      })

      Quagga.start()
      isScanning.value = true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start camera'
      error.value = errorMessage
      onError?.(err instanceof Error ? err : new Error(errorMessage))
    } finally {
      isInitializing.value = false
    }
  }

  async function stop() {
    if (isScanning.value) {
      try {
        Quagga.offDetected()
        Quagga.stop()
      } catch {
        // Ignore stop errors
      }
    }
    isScanning.value = false
    isInitializing.value = false
  }

  onScopeDispose(() => {
    stop()
  })

  return {
    isScanning,
    isInitializing,
    detectedCode,
    error,
    start,
    stop,
  }
}
