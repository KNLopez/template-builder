<template>
  <div class="text-editor relative group">
    <!-- Text Formatting Toolbar -->
    <div 
      v-show="isEditing || isTextSelected"
      class="text-toolbar"
    >
      <!-- Text Style -->
      <div class="flex items-center border-r border-gray-200 pr-2 mr-2">
        <select 
          v-model="selectedStyle"
          class="text-sm border-none bg-transparent focus:ring-0 cursor-pointer"
          @change="applyStyle"
        >
          <option value="normal">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>
      </div>

      <!-- Font Size -->
      <div class="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
        <button 
          @click="decreaseFontSize"
          class="toolbar-btn"
        >
          <span class="text-xs">-</span>
        </button>
        <span class="text-sm">{{ fontSize }}</span>
        <button 
          @click="increaseFontSize"
          class="toolbar-btn"
        >
          <span class="text-xs">+</span>
        </button>
      </div>

      <!-- Text Formatting -->
      <div class="flex items-center gap-1">
        <button 
          @click.prevent="toggleFormat('bold')"
          class="toolbar-btn"
          :class="{ 'bg-gray-200': isBold }"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M13.5,15.5H10V12.5H13.5A1.5,1.5 0 0,1 15,14A1.5,1.5 0 0,1 13.5,15.5M10,6.5H13A1.5,1.5 0 0,1 14.5,8A1.5,1.5 0 0,1 13,9.5H10M15.6,10.79C16.57,10.11 17.25,9 17.25,8C17.25,5.74 15.5,4 13.25,4H7V18H14.04C16.14,18 17.75,16.3 17.75,14.21C17.75,12.69 16.89,11.39 15.6,10.79Z" />
          </svg>
        </button>
        <button 
          @click="toggleFormat('italic')"
          class="toolbar-btn"
          :class="{ 'bg-gray-200': isItalic }"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M10,4V7H12.21L8.79,15H6V18H14V15H11.79L15.21,7H18V4H10Z" />
          </svg>
        </button>
        <button 
          @click="toggleFormat('underline')"
          class="toolbar-btn"
          :class="{ 'bg-gray-200': isUnderline }"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M5,21H19V19H5V21M12,17A6,6 0 0,0 18,11V3H15.5V11A3.5,3.5 0 0,1 12,14.5A3.5,3.5 0 0,1 8.5,11V3H6V11A6,6 0 0,0 12,17Z" />
          </svg>
        </button>
        <div class="h-4 w-px bg-gray-200 mx-1"></div>
        <button 
          @click="toggleAlign('left')"
          class="toolbar-btn"
          :class="{ 'bg-gray-200': textAlign === 'left' }"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M3,3H21V5H3V3M3,7H15V9H3V7M3,11H21V13H3V11M3,15H15V17H3V15M3,19H21V21H3V19Z" />
          </svg>
        </button>
        <button 
          @click="toggleAlign('center')"
          class="toolbar-btn"
          :class="{ 'bg-gray-200': textAlign === 'center' }"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M3,3H21V5H3V3M7,7H17V9H7V7M3,11H21V13H3V11M7,15H17V17H7V15M3,19H21V21H3V19Z" />
          </svg>
        </button>
        <button 
          @click="toggleAlign('right')"
          class="toolbar-btn"
          :class="{ 'bg-gray-200': textAlign === 'right' }"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M3,3H21V5H3V3M9,7H21V9H9V7M3,11H21V13H3V11M9,15H21V17H9V15M3,19H21V21H3V19Z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Editable Content -->
    <div
      ref="editableContent"
      contenteditable="true"
      class="outline-none min-h-[1em] px-1 whitespace-pre-wrap"
      :class="[element.style, textAlignClass]"
      @focus="isEditing = true"
      @blur="handleBlur"
      @input="updateContent"
      @keydown.enter.shift.prevent="handleShiftEnter"
      @mouseup="checkSelection"
      @keyup="checkSelection"
      v-html="element.content"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  element: {
    content: string
    style: string
  }
}>()

const emit = defineEmits(['update:content', 'update:style'])

const editableContent = ref<HTMLElement | null>(null)
const isEditing = ref(false)
const selectedStyle = ref('normal')
const fontSize = ref(16)
const textAlign = ref('left')

const isBold = ref(false)
const isItalic = ref(false)
const isUnderline = ref(false)

const isTextSelected = ref(false)

const textAlignClass = computed(() => {
  return {
    'text-left': textAlign.value === 'left',
    'text-center': textAlign.value === 'center',
    'text-right': textAlign.value === 'right'
  }
})

const updateContent = () => {
  if (editableContent.value) {
    emit('update:content', editableContent.value.innerHTML)
  }
}

const handleShiftEnter = () => {
  document.execCommand('insertLineBreak')
  updateContent()
}

const checkSelection = () => {
  const selection = window.getSelection()
  if (selection) {
    const range = selection.getRangeAt(0)
    isTextSelected.value = !range.collapsed && editableContent.value?.contains(range.commonAncestorContainer)
    
    if (isTextSelected.value) {
      isBold.value = document.queryCommandState('bold')
      isItalic.value = document.queryCommandState('italic')
      isUnderline.value = document.queryCommandState('underline')
    }
  }
}

const handleBlur = () => {
  setTimeout(() => {
    const activeElement = document.activeElement
    if (!activeElement?.closest('.text-toolbar') && !isTextSelected.value) {
      isEditing.value = false
    }
  }, 100)
}

const applyStyle = () => {
  let newStyle = ''
  switch (selectedStyle.value) {
    case 'h1':
      newStyle = 'text-4xl font-bold'
      break
    case 'h2':
      newStyle = 'text-3xl font-bold'
      break
    case 'h3':
      newStyle = 'text-2xl font-bold'
      break
    default:
      newStyle = 'text-base'
  }
  emit('update:style', newStyle)
}

const increaseFontSize = () => {
  fontSize.value = Math.min(fontSize.value + 1, 72)
  updateFontSize()
}

const decreaseFontSize = () => {
  fontSize.value = Math.max(fontSize.value - 1, 8)
  updateFontSize()
}

const updateFontSize = () => {
  if (editableContent.value) {
    editableContent.value.style.fontSize = `${fontSize.value}px`
  }
}

const toggleFormat = (format: 'bold' | 'italic' | 'underline') => {
  const selection = window.getSelection()
  if (selection && !selection.isCollapsed) {
    document.execCommand(format, false)
    switch (format) {
      case 'bold':
        isBold.value = document.queryCommandState('bold')
        break
      case 'italic':
        isItalic.value = document.queryCommandState('italic')
        break
      case 'underline':
        isUnderline.value = document.queryCommandState('underline')
        break
    }
    updateContent()
  }
}

const toggleAlign = (align: 'left' | 'center' | 'right') => {
  textAlign.value = align
}

const handleClickOutside = (event: MouseEvent) => {
  if (!event.target) return
  
  const isToolbarClick = (event.target as Element).closest('.text-toolbar')
  const isEditorClick = (event.target as Element).closest('.text-editor')
  
  if (!isToolbarClick && !isEditorClick) {
    isEditing.value = false
    isTextSelected.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script> 