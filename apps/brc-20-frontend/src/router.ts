import { createWebHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Intro",
    component: () => import("./components/Intro.vue"),
  },
  {
    path: "/mint",
    name: "Mint",
    component: () => import("./components/Home.vue"),
  },
  {
    path: "/analytics/:key",
    name: "Analytics",
    component: () => import("./components/Analytics.vue"),
  },
];

const router = createRouter({
  routes,
  history: createWebHistory(import.meta.env.BASE_URL),
});

export default router;
