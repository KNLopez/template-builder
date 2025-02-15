<template>
  <div class="settings-panel">
    <div class="settings-header">
      <button class="back-button" @click="emit('back')">
        <ArrowLeftIcon class="w-5 h-5" />
      </button>
      <h3 class="settings-title">Image Settings</h3>
    </div>

    <div class="settings-content">
      <div class="tabs">
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'upload' }"
          @click="activeTab = 'upload'"
        >
          Upload
        </button>
        <button 
          class="tab-button"
          :class="{ active: activeTab === 'url' }"
          @click="activeTab = 'url'"
        >
          URL
        </button>
      </div>

      <div v-if="activeTab === 'upload'" class="tab-content">
        <div 
          class="upload-area"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          @click="fileInput?.click()"
          :class="{ 'is-dragging': isDragging }"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileSelect"
          />
          <div class="upload-content">
            <PhotoIcon class="w-8 h-8" />
            <span>Drag image or click to upload</span>
          </div>
        </div>
      </div>

      <div v-else class="tab-content">
        <div class="form-group">
          <label>Image URL</label>
          <input
            type="url"
            v-model="imageUrl"
            placeholder="https://example.com/image.jpg"
            class="input"
            @input="updateImage"
          />
        </div>
      </div>

      <div class="form-group">
        <label>Alt Text</label>
        <input
          type="text"
          v-model="altText"
          placeholder="Image description"
          class="input"
          @input="updateImage"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { PhotoIcon, ArrowLeftIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{
  widget: {
    id: string;
    type: "image";
    content: string;
    alt?: string;
  };
}>();

const emit = defineEmits<{
  (e: "update", widget: typeof props.widget): void;
  (e: "back"): void;
}>();

const activeTab = ref<"upload" | "url">("upload");
const isDragging = ref(false);
const imageUrl = ref(props.widget.content);
const altText = ref(props.widget.alt);
const fileInput = ref<HTMLInputElement | null>(null);

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        imageUrl.value = e.target.result as string;
        updateImage();
      }
    };
    reader.readAsDataURL(file);
  }
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  const file = event.dataTransfer?.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        imageUrl.value = e.target.result as string;
        updateImage();
      }
    };
    reader.readAsDataURL(file);
  }
};

const updateImage = () => {
  emit("update", {
    ...props.widget,
    content: imageUrl.value,
    alt: altText.value,
  });
};
</script>

<style scoped>
@reference "tailwindcss";

.settings-panel {
  @apply h-full flex flex-col;
}

.settings-header {
  @apply flex items-center gap-2 px-6 py-4 border-b border-gray-200;
}

.back-button {
  @apply p-1 rounded-lg text-gray-500 hover:text-gray-700
         hover:bg-gray-100 transition-colors;
}

.settings-title {
  @apply text-lg font-medium text-gray-900;
}

.settings-content {
  @apply flex-1 p-6 space-y-6 overflow-y-auto;
}

.tabs {
  @apply flex gap-2 p-1 bg-gray-100 rounded-lg;
}

.tab-button {
  @apply flex-1 px-4 py-2 text-sm font-medium rounded-md
         text-gray-500 hover:text-gray-700
         transition-colors;
}

.tab-button.active {
  @apply bg-white text-gray-900 shadow-sm;
}

.tab-content {
  @apply mt-4;
}

.upload-area {
  @apply border-2 border-dashed border-gray-300 rounded-lg
         p-6 cursor-pointer
         hover:border-blue-300 hover:bg-blue-50
         transition-all duration-200;
}

.upload-area.is-dragging {
  @apply border-blue-400 bg-blue-50;
}

.upload-content {
  @apply flex flex-col items-center gap-2 text-gray-400;
}

.form-group {
  @apply space-y-2;
}

.form-group label {
  @apply block text-sm font-medium text-gray-700;
}

.input {
  @apply w-full px-3 py-2 rounded-lg border border-gray-300
         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
         transition-colors;
}
</style> 