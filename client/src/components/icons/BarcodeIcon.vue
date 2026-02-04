<script lang="ts" setup>
const props = withDefaults(defineProps<{
  class?: string
}>(), {
  class: 'w-6 h-6',
})
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    :class="props.class"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M3.75 4.5h1.5m0 0v15m0-15h12m-12 15h12m0-15h1.5m-1.5 0v15m0 0h1.5M6 10.5h.008v.008H6V10.5zm0 3h.008v.008H6V13.5zm3-3h.008v.008H9V10.5zm0 3h.008v.008H9V13.5zm3-3h.008v.008H12V10.5zm0 3h.008v.008H12V13.5zm3-3h.008v.008H15V10.5zm0 3h.008v.008H15V13.5z"
    />
  </svg>
</template>
