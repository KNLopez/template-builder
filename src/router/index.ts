import { createRouter, createWebHistory } from "vue-router";
import TemplateBuilder from "../pages/TemplateBuilder/TemplateBuilder.vue";
import TemplateChooser from "../pages/TemplateChooser.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "choose",
      component: TemplateChooser,
    },
    {
      path: "/builder",
      name: "builder",
      component: TemplateBuilder,
    },
  ],
});

export default router;
