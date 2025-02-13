<template>
  <div
    class="image-widget"
    :style="{ left: `${widget.position.x}px`, top: `${widget.position.y}px` }"
  >
    <input
      v-if="!widget.content"
      type="file"
      accept="image/*"
      @change="onImageSelect"
      class="file-input"
    />
    <img
      v-else
      :src="widget.content"
      class="image"
      @click="openFileInput"
    />
  </div>
</template>

<script setup lang="ts">
import type { Widget } from '@/types/widgets';

const props = defineProps<{
  widget: Widget
}>();

const emit = defineEmits<{
  (e: 'update', widget: Widget): void
}>();

const onImageSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      emit('update', {
        ...props.widget,
        content: e.target?.result
      });
    };
    reader.readAsDataURL(input.files[0]);
  }
};

const openFileInput = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => onImageSelect(e);
  input.click();
};
</script>

<style scoped>
@reference "tailwindcss";

.image-widget {
  @apply absolute min-w-[100px] min-h-[100px];
}

.file-input {
  @apply w-full h-full border-2 border-dashed border-gray-300 
         rounded p-4 cursor-pointer;
}

.image {
  @apply max-w-full h-auto cursor-pointer;
}
</style> 