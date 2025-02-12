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
            <label class="block text-sm font-medium text-gray-700 mb-2">Select Data Field</label>
            <div class="mapping-tree border rounded-md divide-y">
              <!-- Root level fields -->
              <div 
                v-for="(value, key) in availableFields" 
                :key="key"
                class="mapping-field"
              >
                <div 
                  class="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                  @click="toggleField(key)"
                >
                  <svg 
                    v-if="typeof value === 'object' && value !== null" 
                    xmlns="http://www.w3.org/2000/svg" 
                    class="h-4 w-4 transition-transform"
                    :class="{ 'rotate-90': expandedFields[key] }"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                  <span 
                    class="hover:text-blue-600"
                    @click.stop="selectField(key)"
                  >
                    {{ key }}
                  </span>
                </div>

                <!-- Nested fields -->
                <div 
                  v-if="typeof value === 'object' && value !== null && expandedFields[key]"
                  class="pl-6 border-t"
                >
                  <div 
                    v-for="(nestedValue, nestedKey) in value" 
                    :key="`${key}.${nestedKey}`"
                    class="mapping-field"
                  >
                    <div 
                      class="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                      @click="toggleField(`${key}.${nestedKey}`)"
                    >
                      <svg 
                        v-if="typeof nestedValue === 'object' && nestedValue !== null" 
                        xmlns="http://www.w3.org/2000/svg" 
                        class="h-4 w-4 transition-transform"
                        :class="{ 'rotate-90': expandedFields[`${key}.${nestedKey}`] }"
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                      <span 
                        class="hover:text-blue-600"
                        @click.stop="selectField(`${key}.${nestedKey}`)"
                      >
                        {{ nestedKey }}
                      </span>
                    </div>

                    <!-- Deep nested fields -->
                    <div 
                      v-if="typeof nestedValue === 'object' && nestedValue !== null && expandedFields[`${key}.${nestedKey}`]"
                      class="pl-6 border-t"
                    >
                      <div 
                        v-for="(deepValue, deepKey) in nestedValue" 
                        :key="`${key}.${nestedKey}.${deepKey}`"
                        class="p-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <span 
                          class="hover:text-blue-600"
                          @click="selectField(`${key}.${nestedKey}.${deepKey}`)"
                        >
                          {{ deepKey }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="mappingKey" class="bg-blue-50 p-3 rounded-md">
            <div class="text-sm font-medium text-gray-700 mb-1">Selected Mapping:</div>
            <code class="text-sm text-blue-700">{{ mappingKey }}</code>
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
            :disabled="!mappingKey"
          >
            Apply Mapping
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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
const expandedFields = ref<Record<string, boolean>>({})

// Available fields structure
const availableFields = {
  id: 'string',
  name: 'string',
  coordinates: {
    lat: 'number',
    lng: 'number'
  },
  status: 'string',
  lastUpdated: 'string',
  measurements: {
    temperature: 'number',
    humidity: 'number',
    pressure: 'number'
  },
  metadata: {
    deviceId: 'string',
    installationDate: 'string',
    type: 'string'
  },
  images: [{
    id: 'string',
    url: 'string',
    caption: 'string',
    timestamp: 'string'
  }]
}

const toggleField = (key: string) => {
  expandedFields.value[key] = !expandedFields.value[key]
}

const selectField = (key: string) => {
  mappingKey.value = key
}

const applyMapping = () => {
  emit('update:mapping', mappingKey.value)
  showMapping.value = false
}
</script> 