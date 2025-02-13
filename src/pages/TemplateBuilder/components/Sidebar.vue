<template>
  <div class="sidebar">
    <div class="section">
      <h3 class="text-sm font-medium text-gray-700 mb-3">Settings</h3>
      <!-- Page settings will go here -->
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
@reference "tailwindcss";

.sidebar {
  @apply w-80 bg-white border-l border-gray-200 p-4 flex flex-col gap-6;
}

.section {
  @apply border-b border-gray-200 pb-4;
}
</style> 