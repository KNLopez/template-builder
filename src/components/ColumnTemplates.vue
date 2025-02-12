<template>
  <div class="templates-grid">
    <h3 class="text-lg font-semibold mb-4">Templates</h3>
    
    <!-- Template Categories -->
    <div class="mb-6">
      <div class="flex gap-2 mb-4">
        <button 
          v-for="cat in categories" 
          :key="cat"
          @click="activeCategory = cat"
          class="px-3 py-1 rounded-full text-sm"
          :class="activeCategory === cat ? 'bg-blue-500 text-white' : 'bg-gray-100'"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- Templates Grid -->
    <div class="grid grid-cols-2 gap-4">
      <button 
        v-for="template in filteredTemplates" 
        :key="template.name"
        @click="$emit('select', template)"
        class="template-preview"
      >
        <div class="preview-container">
          <img :src="template.preview" alt="" class="w-full h-32 object-cover rounded mb-2">
        </div>
        <span class="text-sm font-medium">{{ template.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const activeCategory = ref('Content')

const categories = [
  'Content',
  'Headers',
  'Features',
  'Gallery'
]

const templates = [
  {
    name: 'Text with Image',
    category: 'Content',
    preview: '/templates/text-image.png', // You'll need to add these preview images
    columns: [
      {
        width: '50%',
        type: 'content',
        elements: [
          {
            id: 1,
            type: 'text',
            content: 'Your compelling headline here',
            style: 'text-2xl font-bold mb-4'
          },
          {
            id: 2,
            type: 'text',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            style: 'text-gray-600'
          }
        ]
      },
      {
        width: '50%',
        type: 'content',
        elements: [
          {
            id: 3,
            type: 'image',
            content: 'https://via.placeholder.com/400x300'
          }
        ]
      }
    ]
  },
  {
    name: 'Three Column Features',
    category: 'Features',
    preview: '/templates/features.png',
    columns: [
      {
        width: '33.33%',
        type: 'content',
        elements: [
          {
            id: 1,
            type: 'text',
            content: 'Feature 1',
            style: 'text-xl font-bold mb-2'
          },
          {
            id: 2,
            type: 'text',
            content: 'Description of feature 1',
            style: 'text-gray-600'
          }
        ]
      },
      {
        width: '33.33%',
        type: 'content',
        elements: [
          {
            id: 3,
            type: 'text',
            content: 'Feature 2',
            style: 'text-xl font-bold mb-2'
          },
          {
            id: 4,
            type: 'text',
            content: 'Description of feature 2',
            style: 'text-gray-600'
          }
        ]
      },
      {
        width: '33.33%',
        type: 'content',
        elements: [
          {
            id: 5,
            type: 'text',
            content: 'Feature 3',
            style: 'text-xl font-bold mb-2'
          },
          {
            id: 6,
            type: 'text',
            content: 'Description of feature 3',
            style: 'text-gray-600'
          }
        ]
      }
    ]
  }
  // Add more templates here...
]

const filteredTemplates = computed(() => {
  return templates.filter(t => t.category === activeCategory.value)
})

defineEmits(['select'])
</script>

