<template>
  <div class="mappable-element group">
    <!-- Element Controls -->
    <div class="element-controls">
      <button 
        class="control-button delete"
        @click="$emit('delete')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div class="w-px h-4 bg-gray-200"></div>
      <button 
        class="control-button"
        @click="showMapping = true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </button>
      <div class="w-px h-4 bg-gray-200"></div>
      <div class="control-button move">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </div>
    </div>

    <!-- Mapping Badge -->
    <div 
      v-if="element.mapping"
      class="mapping-badge"
    >
      {{ element.mapping }}
    </div>

    <!-- Element Content -->
    <TextEditor 
      v-if="element.type === 'text'" 
      :element="element"
      @update:content="$emit('update:content', $event)"
      @update:style="$emit('update:style', $event)"
    />
    <div v-else-if="element.type === 'image'" class="relative">
      <img 
        :src="element.content" 
        alt="" 
        class="w-full h-auto"
      />
    </div>

    <!-- Mapping Modal -->
    <div v-if="showMapping" class="modal-overlay" @click.self="showMapping = false">
      <div class="modal-content">
        <h3 class="text-lg font-semibold mb-4">Map Element to Data</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Data Key</label>
            <input 
              v-model="mappingKey"
              type="text"
              class="w-full px-3 py-2 border rounded-md"
              placeholder="e.g., user.name"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Preview Data</label>
            <div class="bg-gray-50 p-3 rounded-md">
              <pre class="text-sm">{{ previewData }}</pre>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <button 
            @click="showMapping = false"
            class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button 
            @click="applyMapping"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Apply Mapping
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TextEditor from './TextEditor.vue'

const props = defineProps<{
  element: {
    type: string
    content: string
    style?: string
    mapping?: string
  }
}>()

const emit = defineEmits(['update:content', 'update:style', 'update:mapping', 'delete'])

const showMapping = ref(false)
const mappingKey = ref(props.element.mapping || '')

// Sample data for preview - this could be passed in as a prop
const sampleData = {
  user: {
    name: 'John Doe',
    email: 'john@example.com'
  },
  company: {
    name: 'Acme Inc',
    address: '123 Main St'
  }
}

const previewData = computed(() => {
  try {
    return JSON.stringify(sampleData, null, 2)
  } catch {
    return '{}'
  }
})

const applyMapping = () => {
  emit('update:mapping', mappingKey.value)
  showMapping.value = false
}
</script> 