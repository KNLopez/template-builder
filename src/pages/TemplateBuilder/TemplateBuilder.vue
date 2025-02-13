<template>
  <div class="template-builder">
    <div class="document-container">
      <div class="pages-container group">
        <PageContainer
          :widget="page"
          @update="updatePage"
        />
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

const updatePage = (updatedPage: PageWidget) => {
  page.value = updatedPage;
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