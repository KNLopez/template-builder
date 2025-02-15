<template>
  <div
    class="column-container group"
    :class="{
      'is-editing': isEditing,
      'drag-over': isDragOver,
    }"
    @contextmenu.prevent="showContextMenu"
    @dragover.prevent="handleDragOver"
    @drop.prevent="handleDrop"
  >
    <div v-if="widget.children.length === 0" class="empty-column">
      <button class="add-widget-btn" @click="$emit('show-widgets')">
        <PlusCircleIcon class="w-12 h-12" />
      </button>
    </div>

    <template v-else>
      <component
        v-for="child in widget.children"
        :key="child.id"
        :is="getWidgetComponent(child.type as WidgetType)"
        :widget="child"
        @update="updateChild"
        @editing="handleChildEditing"
      />
    </template>

    <div
      v-if="contextMenuVisible"
      class="context-menu"
      :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
    >
      <button class="context-menu-item" @click="deleteColumn">
        <TrashIcon class="w-4 h-4" />
        <span>Delete Column</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ColumnWidget, Widget, WidgetType } from "@/types/widgets";
import { PlusCircleIcon, TrashIcon } from "@heroicons/vue/24/outline";
import { v4 as uuidv4 } from "uuid";
import { markRaw, ref } from "vue";
import ImageWidget from "../widgets/ImageWidget.vue";
import TextWidget from "../widgets/TextWidget.vue";

const props = defineProps<{
  widget: ColumnWidget;
}>();

const emit = defineEmits<{
  (e: "update", widget: ColumnWidget): void;
  (e: "delete"): void;
  (e: "show-widgets"): void;
}>();

const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const isDragOver = ref(false);
const isEditing = ref(false);

console.log(markRaw(ImageWidget));

const getWidgetComponent = (type: WidgetType) => {
  const components = {
    text: markRaw(TextWidget),
    image: markRaw(ImageWidget),
  };
  return components[type];
};

const addWidget = (type: WidgetType) => {
  const newWidget = {
    id: uuidv4(),
    type,
    content: type === "text" ? "<p>Click to edit text</p>" : "",
  };

  emit("update", {
    ...props.widget,
    children: [...props.widget.children, newWidget],
  });
};

const updateWidth = (event: Event) => {
  const input = event.target as HTMLInputElement;
  emit("update", {
    ...props.widget,
    width: parseInt(input.value),
  });
};

const updateChild = (updatedChild: Widget) => {
  const childIndex = props.widget.children.findIndex(
    (c) => c.id === updatedChild.id
  );
  if (childIndex !== -1) {
    const newChildren = [...props.widget.children];
    newChildren[childIndex] = updatedChild;
    emit("update", {
      ...props.widget,
      children: newChildren,
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
      document.removeEventListener("click", hideMenu);
      document.removeEventListener("contextmenu", hideMenu);
    }
  };

  // Add event listeners with a slight delay to avoid immediate trigger
  setTimeout(() => {
    document.addEventListener("click", hideMenu);
    document.addEventListener("contextmenu", hideMenu);
  }, 0);
};

const deleteColumn = () => {
  contextMenuVisible.value = false;
  emit("delete", props.widget.id);
};

const handleDragOver = (event: DragEvent) => {
  isDragOver.value = true;
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "copy";
  }
};

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false;
  if (!event.dataTransfer) return;

  const widgetType = event.dataTransfer.getData("widget-type") as WidgetType;
  if (widgetType) {
    addWidget(widgetType);
  }
};

const handleChildEditing = (editing: boolean) => {
  isEditing.value = editing;
};
</script>

<style scoped>
@reference "tailwindcss";

.column-container {
  @apply relative min-h-[100px] hover:bg-gray-50 rounded-lg
         transition-all duration-200;
  cursor: grab;
}

.column-container.is-editing {
  cursor: default;
}

.column-container:not(.is-editing):active {
  cursor: grabbing;
}

.empty-column {
  @apply h-full border-2 border-dashed border-gray-200 
         rounded-lg transition-colors
         flex items-center justify-center;
}

.group:hover .empty-column {
  @apply border-blue-200;
}

.add-widget-btn {
  @apply text-gray-400 hover:text-blue-500
         transition-colors duration-200
         p-4 rounded-xl hover:bg-blue-50;
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

.drag-over {
  @apply ring-2 ring-blue-400 ring-offset-2 bg-blue-50;
}

.empty-column.drag-over {
  @apply border-blue-400 bg-blue-50;
}
</style>
