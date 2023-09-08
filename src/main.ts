import "virtual:uno.css"

import { createApp } from "vue"
import "@/styles/main.css"
import App from "./App.vue"

import { setupStore } from "@/store"
import { useAppStore } from "@/store/modules/app"

import router from "@/router"

// create instance
const setupAll = async () => {
  const app = createApp(App)

  setupStore(app)
  app.use(router)

  app.mount("#app")
}

setupAll().then(() => {
  const appstore = useAppStore()
  console.log(appstore.title)
  // we can initialize some additional parameters here
})
