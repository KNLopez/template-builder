<template>
  <div 
    class="column-container group"
    @contextmenu.prevent="showContextMenu"
  >
    <div 
      v-if="widget.children.length === 0"
      class="empty-column"
    >
      <div class="widget-options">
        <div class="widget-option" @click="addWidget('text')">
          <DocumentTextIcon class="w-8 h-8" />
          <span>Add Text</span>
        </div>
        <div class="widget-option" @click="addWidget('image')">
          <PhotoIcon class="w-8 h-8" />
          <span>Add Image</span>
        </div>
      </div>
    </div>
    
    <template v-else>
      <component
        v-for="child in widget.children"
        :key="child.id"
        :is="getWidgetComponent(child.type)"
        :widget="child"
        @update="updateChild"
      />
    </template>

    <div 
      v-if="isEditingWidth"
      class="width-editor"
    >
      <input 
        type="range" 
        min="1" 
        max="12" 
        :value="widget.width"
        @input="updateWidth"
        class="width-slider"
      />
      <div class="width-preview">
        {{ widget.width }}/12 columns
      </div>
    </div>

    <div 
      v-if="contextMenuVisible"
      class="context-menu"
      :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
    >
      <button 
        class="context-menu-item"
        @click="deleteColumn"
      >
        <TrashIcon class="w-4 h-4" />
        <span>Delete Column</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import type { ColumnWidget, Widget, WidgetType } from '@/types/widgets';
import ContainerControls from './ContainerControls.vue';
import { DocumentTextIcon, PhotoIcon, TrashIcon } from '@heroicons/vue/24/outline';

const props = defineProps<{
  widget: ColumnWidget
}>();

const emit = defineEmits<{
  (e: 'update', widget: ColumnWidget): void
  (e: 'delete'): void
}>();

const isEditingWidth = ref(false);
const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

const getWidgetComponent = (type: WidgetType) => {
  const components = {
    text: () => import('../widgets/TextWidget.vue'),
    image: () => import('../widgets/ImageWidget.vue')
  };
  return components[type];
};

const addWidget = (type: WidgetType) => {
  const newWidget: Widget = {
    id: uuidv4(),
    type,
    content: type === 'text' ? 'Click to edit text' : '',
    position: { x: 0, y: 0 }
  };
  
  emit('update', {
    ...props.widget,
    children: [...props.widget.children, newWidget]
  });
};

const updateWidth = (event: Event) => {
  const input = event.target as HTMLInputElement;
  emit('update', {
    ...props.widget,
    width: parseInt(input.value)
  });
};

const updateChild = (updatedChild: Widget) => {
  const childIndex = props.widget.children.findIndex(c => c.id === updatedChild.id);
  if (childIndex !== -1) {
    const newChildren = [...props.widget.children];
    newChildren[childIndex] = updatedChild;
    emit('update', {
      ...props.widget,
      children: newChildren
    });
  }
};

const showContextMenu = (event: MouseEvent) => {
  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Get menu dimensions (approximate if not rendered yet)
  const menuWidth = 160; // min-w-[160px]
  const menuHeight = 40; // approximate height

  // Calculate position, keeping menu within viewport
  let x = event.clientX;
  let y = event.clientY;

  // Adjust if menu would overflow right edge
  if (x + menuWidth > viewportWidth) {
    x = viewportWidth - menuWidth - 10;
  }

  // Adjust if menu would overflow bottom edge
  if (y + menuHeight > viewportHeight) {
    y = viewportHeight - menuHeight - 10;
  }

  contextMenuX.value = x;
  contextMenuY.value = y;
  contextMenuVisible.value = true;

  // Hide menu when clicking outside
  const hideMenu = (e: MouseEvent) => {
    if (!e.defaultPrevented) {
      contextMenuVisible.value = false;
      document.removeEventListener('click', hideMenu);
      document.removeEventListener('contextmenu', hideMenu);
    }
  };
  
  // Add event listeners with a slight delay to avoid immediate trigger
  setTimeout(() => {
    document.addEventListener('click', hideMenu);
    document.addEventListener('contextmenu', hideMenu);
  }, 0);
};

const deleteColumn = () => {
  contextMenuVisible.value = false;
  emit('delete', props.widget.id);
};
</script>

<style scoped>
@reference "tailwindcss";

.column-container {
  @apply relative min-h-[100px] hover:bg-gray-50 rounded-lg;
}

.empty-column {
  @apply h-full border-2 border-dashed border-gray-200 
         rounded-lg transition-colors;
}

.group:hover .empty-column {
  @apply border-blue-200;
}

.widget-options {
  @apply flex gap-4 justify-center items-center h-full opacity-0
         transition-opacity duration-200;
}

.group:hover .widget-options {
  @apply opacity-100;
}

.widget-option {
  @apply flex flex-col items-center gap-1 p-3 cursor-pointer
         text-gray-500 hover:text-blue-600 transition-colors;
}

.width-editor {
  @apply absolute -top-12 left-1/2 -translate-x-1/2 
         bg-white shadow-lg rounded-lg p-3 z-30
         flex flex-col items-center gap-2;
}

.width-slider {
  @apply w-48;
}

.width-preview {
  @apply text-sm text-gray-600;
}

.context-menu {
  @apply fixed z-50 bg-white rounded-lg shadow-lg
         py-1 min-w-[160px]
         border border-gray-200;
}

.context-menu-item {
  @apply flex items-center gap-2 w-full px-4 py-2
         text-sm text-gray-700 hover:bg-gray-50
         transition-colors duration-200
         cursor-pointer;
}
</style> 