<template>
  <div class="controls">
    <div class="controls-inner">
      <button
        class="control-btn"
        @click="$emit('delete')"
      >
        <TrashIcon class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrashIcon } from '@heroicons/vue/24/outline';

defineEmits<{
  (e: 'delete'): void
}>();
</script>

<style scoped>
@reference "tailwindcss";

.controls {
  @apply absolute bg-white/80 rounded-md
         transition-all duration-200 ease-out z-30
         -top-12 right-0;
}

.controls-inner {
  @apply flex gap-1 p-1;
}

.control-btn {
  @apply p-1.5 rounded-sm text-gray-500 hover:text-gray-700 
         hover:bg-gray-100 transition-colors;
}

.group:hover .controls {
  @apply opacity-100;
}
</style>