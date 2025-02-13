<template>
  <div
    class="text-widget"
    :style="{ left: `${widget.position.x}px`, top: `${widget.position.y}px` }"
  >
    <div
      ref="editor"
      class="editor"
      contenteditable="true"
      @input="updateContent"
      v-html="widget.content"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Widget } from '@/types/widgets';

const props = defineProps<{
  widget: Widget
}>();

const emit = defineEmits<{
  (e: 'update', widget: Widget): void
}>();

const editor = ref<HTMLElement | null>(null);

const updateContent = () => {
  if (editor.value) {
    emit('update', {
      ...props.widget,
      content: editor.value.innerHTML
    });
  }
};
</script>

<style scoped>
@reference "tailwindcss";

.text-widget {
  @apply absolute min-w-[100px] min-h-[24px] p-2 cursor-text;
}

.editor {
  @apply outline-none;
}

.editor:focus {
  @apply ring-2 ring-blue-500 ring-opacity-50;
}
</style> 