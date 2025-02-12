<template>
  <div class="template-builder p-4">
    <!-- Main builder area -->
    <div class="builder-canvas bg-white min-h-screen p-4">
      <draggable 
        v-model="pages" 
        group="pages"
        item-key="id"
        handle=".page-drag-handle"
        class="flex flex-col gap-8"
      >
        <template #item="{ element: page, index }">
          <div 
            class="page group"
            @mouseover="hoveredPage = page.id"
            @mouseleave="hoveredPage = null"
          >
            <!-- Page Header -->
            <div class="page-header">
              <div class="flex items-center gap-2">
                <div class="page-number">Page {{ index + 1 }}</div>
                <div v-if="page.isTemplate" class="template-badge">
                  Template
                </div>
              </div>
              <div class="page-drag-handle">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
            </div>
            
            <!-- Rows container -->
            <draggable 
              v-model="page.rows" 
              group="rows"
              item-key="id"
              class="flex flex-col gap-2"
            >
              <template #item="{ element: row }">
                <div 
                  class="builder-row"
                  :class="{ 'row-hover': hoveredPage === page.id }"
                >
                  <!-- Columns container -->
                  <draggable 
                    v-model="row.columns" 
                    group="columns"
                    item-key="id"
                    class="flex w-full gap-2"
                  >
                    <template #item="{ element: column }">
                      <div 
                        class="builder-column group/column"
                        :style="{ width: column.width }"
                      >
                        <draggable 
                          v-model="column.elements" 
                          group="elements"
                          item-key="id"
                          handle=".control-button.move"
                          class="min-h-full"
                          @change="handleColumnChange(column)"
                        >
                          <template #item="{ element }">
                            <div class="builder-element group">
                              <!-- Element Controls -->
                              <div class="element-controls">
                                <button 
                                  class="control-button delete"
                                  @click="deleteElement(column, element)"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                                <div class="w-px h-4 bg-gray-200"></div>
                                <div class="control-button move">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                                  </svg>
                                </div>
                              </div>

                              <!-- Element Content -->
                              <MappableElement 
                                :element="element"
                                @update:content="element.content = $event"
                                @update:style="element.style = $event"
                                @update:mapping="element.mapping = $event"
                                @delete="deleteElement(column, element)"
                              />
                            </div>
                          </template>

                          <!-- Add this template for empty state -->
                          <template #footer>
                            <div v-if="!column.elements?.length" class="h-full">
                              <button 
                                @click="openElementPicker(column)"
                                class="add-element-button"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Add Element
                              </button>
                            </div>
                          </template>
                        </draggable>

                        <!-- Add Element Button for non-empty columns -->
                        <button 
                          v-if="column.elements?.length"
                          @click="openElementPicker(column)"
                          class="add-more-elements-button opacity-0 group-hover/column:opacity-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Add Element
                        </button>
                      </div>
                    </template>
                  </draggable>
                </div>
              </template>
            </draggable>

            <!-- Add Row Button -->
            <div 
              v-show="hoveredPage === page.id && !showLayoutPicker"
              class="add-row-button"
            >
              <button 
                @click="openLayoutPicker(page.id)"
                class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Row
              </button>
            </div>
          </div>
        </template>
      </draggable>

      <!-- Empty state - Add Page button -->
      <div v-if="pages.length === 0" class="flex justify-center items-center min-h-[400px]">
        <button 
          @click="addPage"
          class="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Page
        </button>
      </div>

      <!-- Add New Page Button (shown when there are existing pages) -->
      <div v-if="pages.length > 0" class="flex justify-center mt-8 gap-4">
        <button 
          @click="addPage"
          class="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New Page
        </button>
        <button 
          @click="addTemplatePage"
          class="px-6 py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Add Template Page
        </button>
      </div>
    </div>

    <!-- Add this after the builder-canvas div, before the modals -->
    <div class="fixed top-4 right-4 z-30">
      <button 
        @click="showImportModal = true"
        class="px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Import Data
      </button>
    </div>

    <!-- Add this new modal -->
    <div v-if="showImportModal" class="modal-overlay">
      <div class="modal-content">
        <h3 class="text-lg font-semibold mb-4">Import Test Data</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">JSON Data</label>
            <textarea
              v-model="importData"
              rows="10"
              class="w-full px-3 py-2 border rounded-md font-mono text-sm"
              placeholder="Paste your JSON data here"
            ></textarea>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>This will replace mapped elements with your data</span>
          </div>
          <div class="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="generatePages"
              v-model="generatePagesFromData"
              class="rounded text-purple-500"
            >
            <label for="generatePages" class="text-sm text-gray-700">
              Generate pages from array data using template
            </label>
          </div>
        </div>
        <div class="flex justify-between mt-4">
          <button 
            @click="showSampleData"
            class="px-4 py-2 text-blue-500 hover:text-blue-600"
          >
            Load Sample Data
          </button>
          <div class="flex gap-2">
            <button 
              @click="showImportModal = false"
              class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button 
              @click="importTestData"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Import
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Column Layout Modal -->
    <div v-if="showLayoutPicker" class="modal-overlay">
      <div class="modal-content">
        <h3 class="text-lg font-semibold mb-4">Choose Column Layout</h3>
        <div class="grid grid-cols-2 gap-4">
          <button 
            v-for="layout in columnLayouts" 
            :key="layout.name"
            @click="addRowWithLayout(layout)"
            class="layout-option"
          >
            <div class="w-full flex gap-1 mb-2 h-12">
              <div 
                v-for="(col, index) in layout.columns" 
                :key="index"
                class="bg-blue-200 rounded"
                :style="{ width: col + '%' }"
              ></div>
            </div>
            <span class="text-sm">{{ layout.name }}</span>
          </button>
        </div>
        <button 
          @click="showLayoutPicker = false"
          class="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Element Picker Modal -->
    <div v-if="showElementPicker" class="modal-overlay">
      <div class="modal-content">
        <div class="flex gap-4 mb-4">
          <button 
            v-for="tab in ['Elements', 'Templates']" 
            :key="tab"
            @click="activeTab = tab"
            class="px-4 py-2 rounded"
            :class="activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-100'"
          >
            {{ tab }}
          </button>
        </div>

        <div v-if="activeTab === 'Elements'">
          <h3 class="text-lg font-semibold mb-4">Add Element</h3>
          <div class="grid grid-cols-2 gap-4">
            <button 
              @click="addTextElement"
              class="element-option"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Text
            </button>
            <ImageUploader @image-selected="handleImageSelected" />
          </div>
        </div>

        <div v-else>
          <ColumnTemplates @select="applyTemplate" />
        </div>

        <button 
          @click="showElementPicker = false"
          class="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import draggable from 'vuedraggable'
import ImageUploader from './ImageUploader.vue'
import ColumnTemplates from './ColumnTemplates.vue'
import TextEditor from './TextEditor.vue'
import MappableElement from './MappableElement.vue'

const pages = ref([])
const showLayoutPicker = ref(false)
const showElementPicker = ref(false)
const hoveredPage = ref(null)
const activeColumn = ref(null)
const activePageId = ref(null)
const activeTab = ref('Elements')
const showImportModal = ref(false)
const importData = ref('')
const generatePagesFromData = ref(false)

// Predefined column layouts
const columnLayouts = [
  {
    name: 'Single Column',
    columns: [100]
  },
  {
    name: 'Two Equal Columns',
    columns: [50, 50]
  },
  {
    name: 'Three Equal Columns',
    columns: [33.33, 33.33, 33.33]
  },
  {
    name: '1/3 + 2/3',
    columns: [33.33, 66.66]
  },
  {
    name: '2/3 + 1/3',
    columns: [66.66, 33.33]
  },
  {
    name: 'Four Equal Columns',
    columns: [25, 25, 25, 25]
  }
]

const addPage = () => {
  pages.value.push({
    id: Date.now(),
    rows: []
  })
}

const openLayoutPicker = (pageId: number) => {
  activePageId.value = pageId
  showLayoutPicker.value = true
}

const openElementPicker = (column: any) => {
  activeColumn.value = column
  showElementPicker.value = true
}

const addRowWithLayout = (layout: { name: string; columns: number[] }) => {
  const pageIndex = pages.value.findIndex(p => p.id === activePageId.value)
  if (pageIndex === -1) return
  
  const newRow = {
    id: Date.now(),
    columns: layout.columns.map(width => ({
      id: Date.now() + Math.random(),
      width: `${width}%`,
      type: 'empty',
      elements: []
    }))
  }
  
  pages.value[pageIndex].rows.push(newRow)
  showLayoutPicker.value = false
}

const handleImageSelected = (imageSource: string) => {
  if (!activeColumn.value) return
  if (activeColumn.value.type === 'empty') {
    activeColumn.value.type = 'content'
    activeColumn.value.elements = []
  }
  activeColumn.value.elements.push({
    id: Date.now(),
    type: 'image',
    content: imageSource
  })
  showElementPicker.value = false
}

const addTextElement = () => {
  if (!activeColumn.value) return
  if (activeColumn.value.type === 'empty') {
    activeColumn.value.type = 'content'
    activeColumn.value.elements = []
  }
  activeColumn.value.elements.push({
    id: Date.now(),
    type: 'text',
    content: 'Double click to edit text'
  })
  showElementPicker.value = false
}

const applyTemplate = (template: any) => {
  if (!activeColumn.value) return
  activeColumn.value.type = 'content'
  activeColumn.value.elements = JSON.parse(JSON.stringify(template.columns[0].elements))
  showElementPicker.value = false
}

const deleteElement = (column: any, element: any) => {
  const index = column.elements.findIndex(e => e.id === element.id)
  if (index !== -1) {
    column.elements.splice(index, 1)
  }
}

const handleColumnChange = (column: any) => {
  if (column.elements.length === 0) {
    column.type = 'empty'
  } else {
    column.type = 'content'
  }
}

const showSampleData = () => {
  const sampleData = {
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      title: 'Senior Developer'
    },
    company: {
      name: 'Acme Inc',
      address: '123 Main St',
      city: 'San Francisco',
      description: 'Leading provider of innovative solutions'
    },
    project: {
      name: 'Website Redesign',
      status: 'In Progress',
      completion: '75%'
    }
  }
  importData.value = JSON.stringify(sampleData, null, 2)
}

const importTestData = () => {
  try {
    const data = JSON.parse(importData.value)
    applyDataToElements(data)
    showImportModal.value = false
  } catch (error) {
    alert('Invalid JSON data')
  }
}

const applyDataToElements = (data: any) => {
  // Helper function to get nested object value
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj)
  }

  // Recursively process all pages, rows, columns, and elements
  pages.value.forEach(page => {
    page.rows.forEach(row => {
      row.columns.forEach(column => {
        if (column.elements) {
          column.elements.forEach(element => {
            if (element.mapping) {
              const value = getNestedValue(data, element.mapping)
              if (value !== undefined) {
                element.content = String(value)
              }
            }
          })
        }
      })
    })
  })
}

const addTemplatePage = () => {
  // Implementation of adding a template page
}
</script> 