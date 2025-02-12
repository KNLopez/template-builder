<template>
  <div class="image-uploader">
    <input 
      type="file" 
      ref="fileInput" 
      class="hidden" 
      accept="image/*"
      @change="handleFileChange"
    />
    <div class="flex flex-col gap-4">
      <button 
        @click="$refs.fileInput.click()"
        class="element-option"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4-4m0 0l4 4m-4-4v12m6-12v12m6-12v12" />
        </svg>
        Upload Image
      </button>
      <div class="text-sm text-gray-500">
        or paste URL
      </div>
      <input 
        type="text" 
        v-model="imageUrl"
        placeholder="https://example.com/image.jpg"
        class="px-3 py-2 border rounded"
        @keyup.enter="handleUrlSubmit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['image-selected'])
const fileInput = ref<HTMLInputElement | null>(null)
const imageUrl = ref('')

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      emit('image-selected', e.target?.result)
    }
    reader.readAsDataURL(file)
  }
}

const handleUrlSubmit = () => {
  if (imageUrl.value) {
    emit('image-selected', imageUrl.value)
  }
}
</script> 