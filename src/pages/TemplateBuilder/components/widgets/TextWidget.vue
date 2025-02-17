<template>
  <div
    class="text-widget"
    :class="{ 'is-editing': isEditing }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div
      v-if="editor"
      v-show="showToolbar || isEditing"
      class="editor-toolbar"
      @mouseenter="handleToolbarMouseEnter"
      @mouseleave="handleToolbarMouseLeave"
    >
      <!-- Text Style -->
      <select
        class="toolbar-select"
        :value="currentHeading"
        @change="(e) => setHeading((e.target as HTMLSelectElement).value)"
      >
        <option value="paragraph">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>

      <div class="toolbar-divider" />

      <!-- Font Family -->
      <select
        class="toolbar-select"
        :value="currentFont"
        @change="(e) => setFontFamily((e.target as HTMLSelectElement).value)"
      >
        <option value="sans">Sans-serif</option>
        <option value="serif">Serif</option>
        <option value="mono">Monospace</option>
      </select>

      <div class="toolbar-divider" />

      <!-- Basic Formatting -->
      <button
        class="toolbar-btn"
        :class="{ 'is-active': editor?.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <BoldIcon class="w-4 h-4" />
      </button>
      <button
        class="toolbar-btn"
        :class="{ 'is-active': editor?.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <ItalicIcon class="w-4 h-4" />
      </button>
      <button
        class="toolbar-btn"
        :class="{ 'is-active': editor?.isActive('underline') }"
        @click="editor.chain().focus().toggleUnderline().run()"
      >
        <UnderlineIcon class="w-4 h-4" />
      </button>

      <div class="toolbar-divider" />

      <!-- Alignment -->
      <button
        class="toolbar-btn"
        :class="{ 'is-active': editor?.isActive({ textAlign: 'left' }) }"
        @click="editor.chain().focus().setTextAlign('left').run()"
      >
        <AlignLeftIcon class="w-4 h-4" />
      </button>
      <button
        class="toolbar-btn"
        :class="{ 'is-active': editor?.isActive({ textAlign: 'center' }) }"
        @click="editor.chain().focus().setTextAlign('center').run()"
      >
        <AlignCenterIcon class="w-4 h-4" />
      </button>
      <button
        class="toolbar-btn"
        :class="{ 'is-active': editor?.isActive({ textAlign: 'right' }) }"
        @click="editor.chain().focus().setTextAlign('right').run()"
      >
        <AlignRightIcon class="w-4 h-4" />
      </button>

      <div class="toolbar-divider" />

      <!-- Color Picker -->
      <div class="color-picker">
        <input
          type="color"
          :value="currentColor"
          @input="(e) => setColor((e.target as HTMLInputElement).value)"
          class="color-input"
        />
      </div>
    </div>

    <editor-content
      :editor="editor"
      class="editor-content"
      @focus="handleFocus"
      @blur="handleBlur"
    />
  </div>
</template>

<script setup lang="ts">
import {
  BarsArrowDownIcon as AlignCenterIcon,
  Bars3BottomLeftIcon as AlignLeftIcon,
  Bars3BottomRightIcon as AlignRightIcon,
  BoldIcon,
  ItalicIcon,
  Bars3Icon as UnderlineIcon,
} from "@heroicons/vue/24/outline";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import { computed, onBeforeUnmount, ref, watch } from "vue";

const props = defineProps<{
  widget: {
    id: string;
    type: "text";
    content: string;
  };
}>();

const emit = defineEmits<{
  (e: "update", widget: typeof props.widget): void;
  (e: "editing", isEditing: boolean): void;
}>();

const isEditing = ref(false);
const showToolbar = ref(false);
const hideToolbarTimeout = ref<number | null>(null);
const isHoveringToolbar = ref(false);

const editor = useEditor({
  content: props.widget.content,
  extensions: [
    StarterKit,
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    TextStyle,
    FontFamily,
    Color,
  ],
  editorProps: {
    attributes: {
      class: "prose prose-sm max-w-none focus:outline-none",
    },
  },
  onUpdate: ({ editor }) => {
    emit("update", {
      ...props.widget,
      content: editor.getHTML(),
    });
  },
});

const currentHeading = computed(() => {
  if (!editor.value) return "paragraph";
  if (editor.value.isActive("heading", { level: 1 })) return "h1";
  if (editor.value.isActive("heading", { level: 2 })) return "h2";
  if (editor.value.isActive("heading", { level: 3 })) return "h3";
  return "paragraph";
});

const currentFont = computed(() => {
  if (!editor.value) return "sans";
  // Add logic to get current font family
  return "sans";
});

const currentColor = computed(() => {
  if (!editor.value) return "#000000";
  // Add logic to get current color
  return "#000000";
});

const setHeading = (value: string) => {
  if (!editor.value) return;

  if (value === "paragraph") {
    editor.value.chain().focus().setParagraph().run();
  } else {
    const level = parseInt(value.replace("h", ""));
    editor.value.chain().focus().toggleHeading({ level }).run();
  }
};

const setFontFamily = (font: string) => {
  if (!editor.value) return;
  editor.value.chain().focus().setFontFamily(font).run();
};

const setColor = (color: string) => {
  if (!editor.value) return;
  editor.value.chain().focus().setColor(color).run();
};

const handleFocus = () => {
  isEditing.value = true;
  emit("editing", true);
};

const handleBlur = () => {
  isEditing.value = false;
  emit("editing", false);
};

const handleMouseEnter = () => {
  if (hideToolbarTimeout.value) {
    clearTimeout(hideToolbarTimeout.value);
    hideToolbarTimeout.value = null;
  }
  showToolbar.value = true;
};

const handleMouseLeave = () => {
  if (!isEditing.value && !isHoveringToolbar.value) {
    hideToolbarTimeout.value = window.setTimeout(() => {
      showToolbar.value = false;
    }, 150);
  }
};

const handleToolbarMouseEnter = () => {
  isHoveringToolbar.value = true;
  if (hideToolbarTimeout.value) {
    clearTimeout(hideToolbarTimeout.value);
    hideToolbarTimeout.value = null;
  }
};

const handleToolbarMouseLeave = () => {
  isHoveringToolbar.value = false;
  if (!isEditing.value) {
    hideToolbarTimeout.value = window.setTimeout(() => {
      showToolbar.value = false;
    }, 150);
  }
};

onBeforeUnmount(() => {
  if (hideToolbarTimeout.value) {
    clearTimeout(hideToolbarTimeout.value);
  }
  editor.value?.destroy();
});

watch(
  () => props.widget.content,
  (newContent) => {
    const isSame = editor.value?.getHTML() === newContent;
    if (!isSame && editor.value && newContent !== undefined) {
      editor.value.commands.setContent(newContent, false);
    }
  }
);
</script>

<style scoped>
@reference "tailwindcss";

.text-widget {
  @apply relative w-full min-h-[2rem];
}

.text-widget.is-editing {
  @apply ring-2 ring-blue-500 rounded-lg;
}

.editor-content :deep(.ProseMirror) {
  @apply min-h-[2rem] px-4 py-2 rounded-lg
         hover:bg-gray-50 focus:bg-white
         transition-colors duration-200;
}

.editor-toolbar {
  @apply absolute -top-12 left-1/2 -translate-x-1/2
         bg-white rounded-lg shadow-lg border border-gray-200
         flex items-center gap-2 p-2 z-10
         transition-opacity duration-200;
}

.editor-toolbar::after {
  @apply content-[''] absolute left-0 right-0 
         h-3 -bottom-3;
}

.toolbar-select {
  @apply px-2 py-1 text-sm rounded-md border border-gray-200
         bg-white text-gray-700 cursor-pointer
         hover:bg-gray-50 focus:outline-none focus:ring-2
         focus:ring-blue-500 focus:border-blue-500;
}

.color-picker {
  @apply relative;
}

.color-input {
  @apply w-8 h-8 rounded-md cursor-pointer
         border-2 border-gray-200 
         hover:border-blue-500 
         transition-colors duration-200;
}

.toolbar-btn {
  @apply p-1.5 rounded-md text-gray-600
         hover:bg-gray-100 hover:text-gray-900
         transition-colors duration-200
         focus:outline-none focus:ring-2
         focus:ring-blue-500;
}

.toolbar-btn.is-active {
  @apply bg-blue-50 text-blue-600;
}

.toolbar-divider {
  @apply w-px h-6 bg-gray-200 mx-1;
}

/* TipTap Styles */
:deep(.ProseMirror) {
  > * + * {
    @apply mt-4;
  }

  h1 {
    @apply text-3xl font-bold;
  }

  h2 {
    @apply text-2xl font-bold;
  }

  p {
    @apply text-base;
  }
}
</style>
