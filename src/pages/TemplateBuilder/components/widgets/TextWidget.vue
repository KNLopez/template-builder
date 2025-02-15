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
      <button
        class="toolbar-btn"
        @click="editor.chain().focus().toggleBold().run()"
        :class="{ 'is-active': editor?.isActive('bold') }"
      >
        <BoldIcon class="w-4 h-4" />
      </button>
      <button
        class="toolbar-btn"
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor?.isActive('italic') }"
      >
        <ItalicIcon class="w-4 h-4" />
      </button>
      <button
        class="toolbar-btn"
        @click="editor.chain().focus().toggleUnderline().run()"
        :class="{ 'is-active': editor?.isActive('underline') }"
      >
        <UnderlineIcon class="w-4 h-4" />
      </button>
      <div class="toolbar-divider" />
      <button
        class="toolbar-btn"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ 'is-active': editor?.isActive('heading', { level: 1 }) }"
      >
        <Heading1Icon class="w-4 h-4" />
      </button>
      <button
        class="toolbar-btn"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'is-active': editor?.isActive('heading', { level: 2 }) }"
      >
        <Heading2Icon class="w-4 h-4" />
      </button>
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
import { ref, onBeforeUnmount, watch } from "vue";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "@heroicons/vue/24/outline";
import {
  Bars3Icon as Heading1Icon,
  Bars2Icon as Heading2Icon,
} from "@heroicons/vue/24/outline";

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
  extensions: [StarterKit],
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
         flex items-center gap-1 p-1 z-10
         transition-opacity duration-200;
}

.editor-toolbar::after {
  @apply content-[''] absolute left-0 right-0 
         h-3 -bottom-3;
}

.toolbar-btn {
  @apply p-1.5 rounded-md text-gray-600
         hover:bg-gray-100 hover:text-gray-900
         transition-colors duration-200;
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
