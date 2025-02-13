<template>
  <div class="template-builder">
    <div class="document-container">
      <div class="pages-container">
        <template v-for="(page, index) in pages" :key="page.id">
          <PageContainer
            :widget="page"
            @update="updatePage"
            @delete="deletePage"
            @add-page="(position) => handleAddPage(index, position)"
          />
        </template>
      </div>
    </div>
    
    <Sidebar />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import type { PageWidget } from '@/types/widgets';
import Sidebar from './components/Sidebar.vue';
import PageContainer from './components/containers/PageContainer.vue';

// Initialize with a single page
const page = ref<PageWidget>({
  id: uuidv4(),
  type: 'page',
  children: []
});

const pages = ref<PageWidget[]>([page.value]);

const updatePage = (updatedPage: PageWidget) => {
  const index = pages.value.findIndex(p => p.id === updatedPage.id);
  if (index !== -1) {
    pages.value[index] = updatedPage;
  }
};

const deletePage = (id: string) => {
  pages.value = pages.value.filter(p => p.id !== id);
};

const handleAddPage = (index: number, position: 'before' | 'after') => {
  const newPage: PageWidget = {
    id: uuidv4(),
    type: 'page',
    children: []
  };
  
  const newIndex = position === 'before' ? index : index + 1;
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
</style> 