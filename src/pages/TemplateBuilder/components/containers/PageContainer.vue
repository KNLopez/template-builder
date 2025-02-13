<template>
  <div
    class="page-wrapper group/page"
    @mousemove="handleMouseMove"
    @mouseleave="hoverPosition = null"
  >
    <div class="page-container">
      <ContainerControls type="page" @delete="$emit('delete')" />
      <div class="page-content">
        <template v-if="widget.children.length === 0">
          <div class="empty-state">
            <div class="empty-content">
              <button class="empty-state-btn" @click="addRow">
                <PlusCircleIcon class="w-12 h-12 text-blue-500" />
                <span class="text-lg mt-2">Add Row</span>
              </button>
            </div>
          </div>
        </template>

        <template v-else>
          <draggable
            v-model="rows"
            class="rows-container"
            item-key="id"
            handle=".row-drag-handle"
            group="rows"
            ghost-class="sortable-ghost"
            chosen-class="sortable-chosen"
            drag-class="sortable-drag"
          >
            <template #item="{ element: row, index }">
              <TransitionGroup tag="div" class="rows-container" name="list">
                <RowContainer
                  :key="row.id"
                  :widget="row"
                  @update="updateChild"
                  @delete="deleteChild"
                  @add-row="(position) => handleAddRow(index, position)"
                />
              </TransitionGroup>
            </template>
          </draggable>
        </template>
      </div>
    </div>

    <!-- Add page button before -->
    <div v-if="hoverPosition === 'top'" class="add-page-indicator top">
      <button class="add-page-btn" @click="$emit('add-page', 'before')">
        <PlusIcon class="w-4 h-4" />
      </button>
    </div>

    <!-- Add page button after -->
    <div v-if="hoverPosition === 'bottom'" class="add-page-indicator bottom">
      <button class="add-page-btn" @click="$emit('add-page', 'after')">
        <PlusIcon class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from "uuid";
import { PlusIcon, PlusCircleIcon } from "@heroicons/vue/24/outline";
import type { PageWidget, RowWidget } from "@/types/widgets";
import ContainerControls from "./ContainerControls.vue";
import RowContainer from "./RowContainer.vue";
import { ref, computed } from "vue";
import draggable from "vuedraggable";
import { TransitionGroup } from "vue";

const props = defineProps<{
  widget: PageWidget;
}>();

const emit = defineEmits<{
  (e: "update", widget: PageWidget): void;
  (e: "delete"): void;
  (e: "add-page", position: "before" | "after"): void;
}>();

const hoverPosition = ref<"top" | "bottom" | null>(null);

const rows = computed({
  get: () => props.widget.children,
  set: (newRows) => {
    emit("update", {
      ...props.widget,
      children: newRows,
    });
  },
});

const addRowAt = (index: number) => {
  const newRow: RowWidget = {
    id: uuidv4(),
    type: "row",
    children: [],
  };
  const newChildren = [...props.widget.children];
  newChildren.splice(index, 0, newRow);
  emit("update", {
    ...props.widget,
    children: newChildren,
  });
};

const addRow = () => {
  addRowAt(props.widget.children.length);
};

const updateChild = (updatedChild: RowWidget) => {
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

const handleAddRow = (index: number, position: "before" | "after") => {
  const newIndex = position === "after" ? index + 1 : index;
  addRowAt(newIndex);
};

const handleMouseMove = (event: MouseEvent) => {
  const element = event.currentTarget as HTMLElement;
  const rect = element.getBoundingClientRect();
  const y = event.clientY - rect.top;

  // Show button when mouse is within 40px of top or bottom edge
  if (y < 40) {
    hoverPosition.value = "top";
  } else if (y > rect.height - 40) {
    hoverPosition.value = "bottom";
  } else {
    hoverPosition.value = null;
  }
};
</script>

<style scoped>
@reference "tailwindcss";

.page-wrapper {
  @apply relative w-[816px] mx-auto py-8;
}

.page-container {
  @apply relative min-h-[1056px] bg-white shadow-sm;
}

.add-page-indicator {
  @apply absolute left-0 right-0 flex justify-center
         transition-all duration-200 z-20;
}

.add-page-indicator.top {
  @apply -top-6;
}

.add-page-indicator.bottom {
  @apply -bottom-6;
}

.add-page-btn {
  @apply w-8 h-8 rounded-full bg-white 
         shadow-[0_2px_4px_rgba(0,0,0,0.1)]
         flex items-center justify-center
         text-blue-500 hover:text-blue-600
         hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)]
         hover:scale-110
         cursor-pointer
         transition-all duration-200;
}

/* Add hover area for better interaction */
.add-page-btn::before {
  @apply content-[''] absolute -inset-2;
}

/* Show indicators on page hover */
.group-hover\/page .add-page-indicator {
  @apply opacity-100;
}

.page-content {
  @apply min-h-[1056px] p-4;
}

.rows-container {
  @apply flex flex-col gap-4;
}

.empty-state {
  @apply min-h-[calc(1056px-2rem)] flex items-center justify-center
         border-2 border-dashed border-gray-200 rounded-lg
         transition-colors group-hover/page:border-blue-200;
}

.empty-content {
  @apply flex flex-col items-center text-gray-500;
}

.empty-state-btn {
  @apply flex flex-col items-center p-8 rounded-xl
         hover:bg-blue-50 transition-colors duration-200;
}

.list-move,
.list-enter-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
}

.list-leave-active {
  position: absolute;
}

.sortable-ghost {
  @apply opacity-50 bg-blue-50 border-2 border-dashed border-blue-200
         transition-all duration-300 transform scale-95;
}

.sortable-chosen {
  @apply shadow-xl scale-[1.02] z-10 bg-white
         transition-all duration-300;
}

.sortable-drag {
  @apply shadow-2xl scale-105 z-50 opacity-90 bg-white
         transition-all duration-300
         cursor-grabbing;
}
</style>
