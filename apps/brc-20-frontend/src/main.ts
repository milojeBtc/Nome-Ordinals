import { createApp } from "vue";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { OhVueIcon, addIcons } from "oh-vue-icons";
import { FaVolumeUp, FaVolumeMute } from "oh-vue-icons/icons/fa";

import "./style.css";
import App from "./App.vue";
import router from "./router";
addIcons(FaVolumeUp, FaVolumeMute);

createApp(App)
  .use(router)
  .use(VueQueryPlugin)
  .component("v-icon", OhVueIcon)
  .mount("#app");
