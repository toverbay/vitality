import { createRouter, createWebHistory } from "vue-router"

const router = createRouter({
  history: createWebHistory("/vitality/"),
  routes: [
    {
      path: "/",
      component: () => import("../views/WelcomePage.vue"),
    },
    {
      path: "/builder",
      component: () => import("../views/BuilderLayout.vue"),
      children: [
        {
          path: "system-info",
          component: () => import("../views/steps/SystemInfoStep.vue"),
          meta: { step: 1 },
        },
        {
          path: "shared-options",
          component: () => import("../views/steps/SharedOptionsStep.vue"),
          meta: { step: 2 },
        },
        {
          path: "templates",
          component: () => import("../views/steps/TemplatesStep.vue"),
          meta: { step: 3 },
        },
        {
          path: "template-fields",
          component: () => import("../views/steps/TemplateFieldsStep.vue"),
          meta: { step: 4 },
        },
        {
          path: "review",
          component: () => import("../views/steps/ReviewStep.vue"),
          meta: { step: 5 },
        },
        {
          path: "",
          redirect: "system-info",
        },
      ],
    },
  ],
})

export default router
