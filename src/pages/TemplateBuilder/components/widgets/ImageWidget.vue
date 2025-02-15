<template>
  <div
    class="image-widget"
    :class="{ 'is-empty': !widget.content }"
    @click="!widget.content && emit('showSettings')"
  >
    <div v-if="!widget.content" class="empty-state">
      <PhotoIcon class="w-8 h-8" />
      <span>Click to add image</span>
    </div>
    <img
      v-else
      :src="widget.content"
      :alt="widget.alt || ''"
      class="image-content"
    />
    <button
      v-if="widget.content"
      class="edit-button"
      @click="emit('showSettings')"
    >
      <Cog6ToothIcon class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { PhotoIcon, Cog6ToothIcon } from "@heroicons/vue/24/outline";

interface ImageWidget {
  id: string;
  type: "image";
  content: string; // URL
  alt?: string;
}

const props = defineProps<{
  widget: ImageWidget;
}>();

const emit = defineEmits<{
  (e: "update", widget: ImageWidget): void;
  (e: "showSettings"): void;
}>();
</script>

<style scoped>
@reference "tailwindcss";

.image-widget {
  @apply relative w-full min-h-[200px] rounded-lg overflow-hidden
         border-2 border-dashed border-gray-200
         transition-all duration-200;
}

.image-widget.is-empty {
  @apply hover:border-blue-300 hover:bg-blue-50 cursor-pointer;
}

.empty-state {
  @apply h-full flex flex-col items-center justify-center gap-2
         text-gray-400;
}

.image-content {
  @apply w-full h-full object-cover;
}

.edit-button {
  @apply absolute top-2 right-2 p-2
         bg-white/90 rounded-lg shadow-sm
         text-gray-600 hover:text-gray-900
         opacity-0 group-hover:opacity-100
         transition-all duration-200;
}
</style>
