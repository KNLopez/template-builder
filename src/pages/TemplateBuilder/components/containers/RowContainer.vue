<template>
  <div
    class="row-container group"
    :class="{ 'row-empty': widget.children.length === 0 }"
    @mousemove="handleMouseMove"
    @mouseleave="hoverPosition = null"
  >
    <div class="row-controls">
      <button class="control-btn row-drag-handle cursor-move">
        <Bars3Icon class="w-5 h-5" />
      </button>
      <button class="control-btn" @click="showColumnEditor = true">
        <Squares2X2Icon class="w-5 h-5" />
      </button>
      <button class="control-btn" @click="$emit('delete', widget.id)">
        <TrashIcon class="w-5 h-5" />
      </button>
    </div>

    <!-- Column Editor Modal -->
    <div
      v-if="showColumnEditor"
      class="modal-overlay"
      @click="showColumnEditor = false"
    >
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">Edit Columns</h3>
        <div class="column-options">
          <button
            v-for="count in 3"
            :key="count"
            class="column-option"
            :class="{ active: widget.children.length === count }"
            @click="updateColumns(count)"
          >
            <div class="column-preview">
              <div v-for="n in count" :key="n" class="preview-column" />
            </div>
            <span>{{ count }} Column{{ count > 1 ? "s" : "" }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Warning Modal -->
    <div v-if="showWarning" class="modal-overlay" @click="cancelColumnUpdate">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title text-red-600">Warning</h3>
        <p class="modal-message">
          Reducing columns will remove content from the rightmost columns. Are
          you sure you want to proceed?
        </p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="cancelColumnUpdate">
            Cancel
          </button>
          <button class="btn-danger" @click="confirmColumnUpdate">
            Proceed
          </button>
        </div>
      </div>
    </div>

    <!-- Top add button -->
    <div v-if="hoverPosition === 'top'" class="add-row-indicator top">
      <button class="add-row-btn" @click="$emit('add-row', 'before')">
        <PlusIcon class="w-4 h-4" />
      </button>
    </div>

    <!-- Bottom add button -->
    <div v-if="hoverPosition === 'bottom'" class="add-row-indicator bottom">
      <button class="add-row-btn" @click="$emit('add-row', 'after')">
        <PlusIcon class="w-4 h-4" />
      </button>
    </div>

    <div v-if="widget.children.length === 0" class="empty-row">
      <div class="column-options">
        <button
          v-for="count in 3"
          :key="count"
          class="column-option"
          @click="addColumn(count)"
        >
          <div class="column-preview">
            <div v-for="n in count" :key="n" class="preview-column" />
          </div>
          <span>{{ count }} Column{{ count > 1 ? "s" : "" }}</span>
        </button>
      </div>
    </div>

    <div v-else class="row-content">
      <draggable
        v-model="columns"
        :class="`grid grid-cols-${widget.children.length} gap-4 w-full`"
        item-key="id"
        group="columns"
        :animation="300"
        ghost-class="sortable-ghost"
        chosen-class="sortable-chosen"
        drag-class="sortable-drag"
      >
        <template #item="{ element: column }">
          <TransitionGroup tag="div" class="column-wrapper" name="list">
            <ColumnContainer
              :key="column.id"
              :widget="column"
              @update="updateChild"
              @delete="deleteChild"
            />
          </TransitionGroup>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { v4 as uuidv4 } from "uuid";
import {
  PlusIcon,
  Squares2X2Icon,
  TrashIcon,
  Bars3Icon,
} from "@heroicons/vue/24/outline";
import type { RowWidget, ColumnWidget } from "@/types/widgets";
import ColumnContainer from "./ColumnContainer.vue";
import draggable from "vuedraggable";
import { TransitionGroup } from "vue";

const props = defineProps<{
  widget: RowWidget;
}>();

const emit = defineEmits<{
  (e: "update", widget: RowWidget): void;
  (e: "delete", id: string): void;
  (e: "add-row", position: "before" | "after"): void;
}>();

const hoverPosition = ref<"top" | "bottom" | null>(null);
const showColumnEditor = ref(false);
const showWarning = ref(false);
const pendingColumnCount = ref(0);

const columns = computed({
  get: () => props.widget.children,
  set: (newColumns) => {
    // Recalculate column widths when order changes
    const updatedColumns = newColumns.map((col, index) => ({
      ...col,
      width: 12 / newColumns.length,
    }));

    emit("update", {
      ...props.widget,
      children: updatedColumns,
    });
  },
});

const handleMouseMove = (event: MouseEvent) => {
  const element = event.currentTarget as HTMLElement;
  const rect = element.getBoundingClientRect();
  const y = event.clientY - rect.top;

  // Show button when mouse is within 20px of top or bottom edge
  if (y < 20) {
    hoverPosition.value = "top";
  } else if (y > rect.height - 20) {
    hoverPosition.value = "bottom";
  } else {
    hoverPosition.value = null;
  }
};

const addColumn = (count: number) => {
  const columns: ColumnWidget[] = Array(count)
    .fill(null)
    .map(() => ({
      id: uuidv4(),
      type: "column",
      width: 12 / count,
      children: [],
    }));

  emit("update", {
    ...props.widget,
    children: columns,
  });
};

const updateChild = (updatedChild: ColumnWidget) => {
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

const deleteChild = (childId: string) => {
  emit("update", {
    ...props.widget,
    children: props.widget.children.filter((c) => c.id !== childId),
  });
};

const updateColumns = (count: number) => {
  if (
    count < props.widget.children.length &&
    hasContentInRemovedColumns(count)
  ) {
    pendingColumnCount.value = count;
    showWarning.value = true;
  } else {
    applyColumnUpdate(count);
  }
  showColumnEditor.value = false;
};

const hasContentInRemovedColumns = (newCount: number) => {
  return props.widget.children
    .slice(newCount)
    .some((col) => col.children.length > 0);
};

const applyColumnUpdate = (count: number) => {
  const currentColumns = [...props.widget.children];
  const newColumns: ColumnWidget[] = [];

  // Keep existing columns up to the new count
  for (let i = 0; i < count; i++) {
    if (i < currentColumns.length) {
      newColumns.push({
        ...currentColumns[i],
        width: 12 / count,
      });
    } else {
      newColumns.push({
        id: uuidv4(),
        type: "column",
        width: 12 / count,
        children: [],
      });
    }
  }

  emit("update", {
    ...props.widget,
    children: newColumns,
  });
};

const cancelColumnUpdate = () => {
  showWarning.value = false;
  pendingColumnCount.value = 0;
};

const confirmColumnUpdate = () => {
  applyColumnUpdate(pendingColumnCount.value);
  showWarning.value = false;
  pendingColumnCount.value = 0;
};
</script>

<style scoped>
@reference "tailwindcss";

.row-container {
  @apply relative p-4 transition-all duration-200 min-h-[100px]
         hover:bg-gray-50 rounded-lg;
}

.add-row-indicator {
  @apply absolute left-0 right-0 flex justify-center
         pointer-events-none z-10;
}

.add-row-indicator.top {
  @apply -top-3;
}

.add-row-indicator.bottom {
  @apply -bottom-3;
}

.add-row-btn {
  @apply w-6 h-6 rounded-full bg-white 
         shadow-[0_2px_4px_rgba(0,0,0,0.1)]
         flex items-center justify-center
         text-blue-500 hover:text-blue-600
         hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)]
         hover:scale-110
         pointer-events-auto
         transition-all duration-200;
}

/* Adjust hover area for better interaction */
.add-row-btn::before {
  @apply content-[''] absolute -inset-2;
}

.empty-row {
  @apply h-full border-2 border-dashed border-gray-200 
         rounded-lg transition-colors;
}

.group:hover .empty-row {
  @apply border-blue-200;
}

.column-options {
  @apply flex gap-4 justify-center items-center h-full;
}

.column-option {
  @apply flex flex-col items-center gap-2 p-3
         text-gray-500 hover:text-blue-600 transition-colors;
}

.column-preview {
  @apply flex gap-1 w-24 h-12 bg-gray-50 rounded-md p-1;
}

.preview-column {
  @apply flex-1 bg-gray-200 rounded;
}

.group:hover .preview-column {
  @apply bg-blue-200;
}

.row-content {
  @apply w-full;
}

.column-wrapper {
  @apply w-full min-h-[100px] transition-all duration-300;
  cursor: grab;
}

.column-wrapper:active {
  cursor: grabbing;
}

.grid {
  @apply w-full;
}

.grid-cols-1 {
  @apply grid-cols-1;
}
.grid-cols-2 {
  @apply grid-cols-2;
}
.grid-cols-3 {
  @apply grid-cols-3;
}

.row-controls {
  @apply absolute top-2 right-2 flex gap-1 opacity-0
         bg-white/80 rounded-md p-1 transition-all duration-200 z-30;
}

.group:hover .row-controls {
  @apply opacity-100;
}

.control-btn {
  @apply p-1.5 rounded-sm text-gray-500 hover:text-gray-700 
         hover:bg-gray-100 transition-colors;
}

.modal-overlay {
  @apply fixed inset-0 bg-black/50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg p-6 max-w-md w-full mx-4;
}

.modal-title {
  @apply text-lg font-semibold mb-4;
}

.modal-message {
  @apply text-gray-600 mb-6;
}

.modal-actions {
  @apply flex justify-end gap-3;
}

.btn-secondary {
  @apply px-4 py-2 rounded-md border border-gray-300
         text-gray-700 hover:bg-gray-50 transition-colors;
}

.btn-danger {
  @apply px-4 py-2 rounded-md bg-red-500 text-white
         hover:bg-red-600 transition-colors;
}

.column-option.active {
  @apply text-blue-600;
}

.column-option.active .preview-column {
  @apply bg-blue-200;
}

.list-move {
  transition: transform 0.3s ease;
}

.sortable-ghost {
  @apply opacity-50 bg-blue-50 border-2 border-dashed border-blue-200
         transition-all duration-300 transform scale-95;
}

.sortable-chosen {
  @apply shadow-xl scale-[1.02] z-10 bg-white
         transition-all duration-300;
  cursor: grabbing;
}

.sortable-drag {
  @apply shadow-2xl scale-105 z-50 opacity-90 bg-white
         transition-all duration-300;
  cursor: grabbing;
}
</style>
