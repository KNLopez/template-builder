<template>
  <div class="template-builder">
    <div class="document-container">
      <draggable
        v-model="pages"
        class="pages-container"
        item-key="id"
        handle=".page-drag-handle"
        group="pages"
        :animation="300"
        ghost-class="sortable-ghost"
        chosen-class="sortable-chosen"
        drag-class="sortable-drag"
        @end="handleDragEnd"
      >
        <template #item="{ element: page }">
          <TransitionGroup tag="div" class="pages-container" name="list">
            <PageContainer
              :widget="page"
              @update="updatePage"
              @delete="deletePage"
              @add-page="(position) => handleAddPage(index, position)"
            />
          </TransitionGroup>
        </template>
      </draggable>
    </div>

    <Sidebar />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { v4 as uuidv4 } from "uuid";
import type { PageWidget } from "@/types/widgets";
import Sidebar from "./components/Sidebar.vue";
import PageContainer from "./components/containers/PageContainer.vue";
import draggable from "vuedraggable";
import { TransitionGroup } from "vue";

const pages = ref<PageWidget[]>([
  {
    id: uuidv4(),
    type: "page",
    children: [],
  },
]);

const updatePage = (updatedPage: PageWidget) => {
  const index = pages.value.findIndex((p) => p.id === updatedPage.id);
  if (index !== -1) {
    pages.value[index] = updatedPage;
  }
};

const deletePage = (id: string) => {
  pages.value = pages.value.filter((p) => p.id !== id);
};

const handleAddPage = (index: number, position: "before" | "after") => {
  const newPage: PageWidget = {
    id: uuidv4(),
    type: "page",
    children: [],
  };

  const newIndex = position === "before" ? index : index + 1;
  pages.value.splice(newIndex, 0, newPage);
};
</script>

<style scoped>
@reference "tailwindcss";

.template-builder {
  @apply h-[calc(100vh-80px)] flex;
}

.document-container {
  @apply flex-1 bg-gray-100 overflow-auto;
}

.pages-container {
  @apply p-8 flex flex-col gap-8;
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
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
