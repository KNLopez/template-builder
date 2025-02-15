<template>
  <div class="sidebar">
    <template v-if="activeWidget">
      <component
        :is="getSettingsComponent(activeWidget.type)"
        :widget="activeWidget"
        @update="handleSettingsUpdate"
        @back="activeWidget = null"
      />
    </template>
    <template v-else>
      <div class="sidebar-header">
        <h2 class="sidebar-title">Add Elements</h2>
      </div>
      <div class="sidebar-content">
        <div class="widgets-section">
          <h3 class="section-title">Basic</h3>
          <div class="widgets-grid">
            <div
              v-for="widget in basicWidgets"
              :key="widget.type"
              class="widget-option"
              draggable="true"
              @dragstart="handleDragStart($event, widget.type)"
            >
              <TransitionGroup name="fade">
                <div
                  :key="widget.type"
                  class="w-full h-full flex items-center gap-3"
                >
                  <div class="widget-icon">
                    <component :is="widget.icon" class="w-5 h-5" />
                  </div>
                  <span class="widget-label">{{ widget.label }}</span>
                </div>
              </TransitionGroup>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  Square2StackIcon,
  ArrowsUpDownIcon,
  StarIcon,
  MapIcon,
  RectangleStackIcon,
} from "@heroicons/vue/24/outline";
import type { WidgetType, Widget } from "@/types/widgets";
import { ref } from "vue";
import ImageSettings from "./settings/ImageSettings.vue";

const basicWidgets = [
  { type: "text", label: "Text", icon: DocumentTextIcon },
  { type: "image", label: "Image", icon: PhotoIcon },
  { type: "video", label: "Video", icon: VideoCameraIcon },
  { type: "button", label: "Button", icon: Square2StackIcon },
  { type: "divider", label: "Divider", icon: ArrowsUpDownIcon },
  { type: "spacer", label: "Spacer", icon: ArrowsUpDownIcon },
  { type: "map", label: "Maps", icon: MapIcon },
  { type: "icon", label: "Icon", icon: StarIcon },
] as const;

const activeWidget = ref<Widget | null>(null);

const getSettingsComponent = (type: string) => {
  const components = {
    image: ImageSettings,
    // Add other widget settings components here
  };
  return components[type as keyof typeof components];
};

const handleSettingsUpdate = (updatedWidget: Widget) => {
  emit("update-widget", updatedWidget);
};

const handleDragStart = (event: DragEvent, type: WidgetType) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("widget-type", type);
  }
};

defineExpose({
  showSettings: (widget: Widget) => {
    activeWidget.value = widget;
  },
});
</script>

<style scoped>
@reference "tailwindcss";

.sidebar {
  @apply w-80 border-l border-gray-200 bg-white flex flex-col;
}

.sidebar-header {
  @apply px-6 py-4 border-b border-gray-200;
}

.sidebar-title {
  @apply text-lg font-medium text-gray-900;
}

.sidebar-content {
  @apply flex-1 overflow-y-auto;
}

.widgets-section {
  @apply p-4;
}

.section-title {
  @apply text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 px-2;
}

.widgets-grid {
  @apply grid grid-cols-2 gap-2;
}

.widget-option {
  @apply flex items-center gap-3 p-3
         border border-gray-200 rounded-lg
         bg-white hover:bg-gray-50
         text-gray-600 hover:text-gray-900
         hover:border-gray-300
         transition-all duration-200
         cursor-grab active:cursor-grabbing;
}

.widget-icon {
  @apply p-2 rounded-md bg-gray-50 
         group-hover:bg-white
         text-gray-400 group-hover:text-blue-500
         transition-colors duration-200;
}

.widget-label {
  @apply text-sm font-medium;
}
</style>
