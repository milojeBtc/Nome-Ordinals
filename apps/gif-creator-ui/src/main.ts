import { createApp } from "vue";
import VueGtag from "vue-gtag";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";

import App from "./App.vue";
import "./global.css";
import router from "./router.ts";

const pinia = createPinia();
const app = createApp(App);

app
  .use(VueGtag, {
    config: { id: "G-HZQ4TKL9G9" },
  })
  .use(pinia)
  .use(router as any)
  .use(VueQueryPlugin)
  .mount("#app");
