<script lang="ts" setup>
import logoSvg from '@/assets/logo.svg'

export interface LogoProps {
  dark?: boolean
  label: string
  iconOnly?: boolean
}

const props = withDefaults(defineProps<LogoProps>(), { dark: false })
const { dark, label, iconOnly } = toRefs(props)
</script>

<template>
  <div class="shrink-0 flex items-center py-1 select-none">
    <img :src="logoSvg" alt="" aria-hidden="true" class="h-9 w-auto" />
    <span class="sr-only">{{ label }}</span>
    <span
      v-if="!iconOnly"
      class="font-sans-safe font-semibold text-xl ml-3"
      :class="[
        dark ? 'text-gray-50' : 'text-gray-800 dark:text-gray-50',
      ]"
      aria-hidden="true"
    >
      SpineStack
    </span>
  </div>
</template>
