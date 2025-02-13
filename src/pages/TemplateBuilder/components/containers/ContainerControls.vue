<template>
  <div 
    class="controls"
    :class="{
      'controls-page': type === 'page',
      'controls-row': type === 'row'
    }"
  >
    <div class="controls-inner">
      <button
        v-if="type === 'column'"
        class="control-btn"
        @click="$emit('edit')"
      >
        <Squares2X2Icon class="w-5 h-5" />
      </button>
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
import { Squares2X2Icon, TrashIcon } from '@heroicons/vue/24/outline';
import type { WidgetType } from '@/types/widgets';

defineProps<{
  type: WidgetType
}>();

defineEmits<{
  (e: 'edit'): void
  (e: 'delete'): void
}>();
</script>

<style scoped>
@reference "tailwindcss";

.controls {
  @apply absolute opacity-0 bg-white/80 rounded-md
         transition-all duration-200 ease-out z-30;
}

.controls-page {
  @apply -top-10 right-0;
}

.controls-row {
  @apply top-2 right-2;
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