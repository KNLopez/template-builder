<template>
  <div class="page-wrapper group/page">
    <ContainerControls
      type="page"
      @delete="$emit('delete')"
    />
    <div class="page-container">
      <div class="page-content">
        <template v-if="widget.children.length === 0">
          <div class="empty-state">
            <div class="empty-content">
              <button 
                class="empty-state-btn"
                @click="addRow"
              >
                <PlusCircleIcon class="w-12 h-12 text-blue-500" />
                <span class="text-lg mt-2">Add Row</span>
              </button>
            </div>
          </div>
        </template>
        
        <template v-else>
          <div class="rows-container">
            <template v-for="(child, index) in widget.children" :key="child.id">
              <RowContainer
                :widget="child"
                @update="updateChild"
                @delete="deleteChild"
                @add-row="(position) => handleAddRow(index, position)"
              />
            </template>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid';
import { PlusIcon, PlusCircleIcon } from '@heroicons/vue/24/outline';
import type { PageWidget, RowWidget } from '@/types/widgets';
import ContainerControls from './ContainerControls.vue';
import RowContainer from './RowContainer.vue';

const props = defineProps<{
  widget: PageWidget
}>();

const emit = defineEmits<{
  (e: 'update', widget: PageWidget): void
  (e: 'delete'): void
}>();

const addRowAt = (index: number) => {
  const newRow: RowWidget = {
    id: uuidv4(),
    type: 'row',
    children: []
  };
  const newChildren = [...props.widget.children];
  newChildren.splice(index, 0, newRow);
  emit('update', {
    ...props.widget,
    children: newChildren
  });
};

const addRow = () => {
  addRowAt(props.widget.children.length);
};

const updateChild = (updatedChild: RowWidget) => {
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

const deleteChild = (childId: string) => {
  emit('update', {
    ...props.widget,
    children: props.widget.children.filter(c => c.id !== childId)
  });
};

const handleAddRow = (index: number, position: 'before' | 'after') => {
  const newIndex = position === 'before' ? index : index + 1;
  addRowAt(newIndex);
};
</script>

<style scoped>
@reference "tailwindcss";

.page-wrapper {
  @apply relative w-[816px] mx-auto;
}

.page-container {
  @apply min-h-[1056px] bg-white shadow-sm;
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
</style> 