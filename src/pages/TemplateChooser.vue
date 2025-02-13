<template>
  <div class="template-chooser">
    <h1 class="title">Start a new document</h1>
    
    <div class="templates-grid">
      <div 
        class="template-card"
        @click="selectTemplate('blank')"
      >
        <div class="preview-container">
          <img src="../assets/blank-template.svg" alt="Blank template" class="template-preview" />
        </div>
        <div class="template-info">
          <h3>Blank</h3>
          <p>Start from an empty page</p>
        </div>
      </div>
      
      <!-- More templates can be added here later -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const selectTemplate = (templateId: string) => {
  router.push({
    name: 'builder',
    query: { template: templateId }
  });
};
</script>

<style scoped>
.template-chooser {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.title {
  font-size: 1.875rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2rem;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
}

.template-card {
  cursor: pointer;
  border-radius: 0.2rem;
  overflow: hidden;
  transition: all 0.2s;
}

.preview-container:hover {
  border: 1px solid #457dee;
}

.preview-container {
  aspect-ratio: 8.5/11;
  border: 1px solid #e5e7eb;
  border-radius: 0.2rem;
  overflow: hidden;
}

.template-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.template-info {
  padding: 1rem 0.5rem;
}

.template-info h3 {
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
  margin: 0;
}

.template-info p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}
</style> 