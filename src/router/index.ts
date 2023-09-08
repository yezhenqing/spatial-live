import { createRouter, createWebHashHistory } from "vue-router"
import type { RouteRecordRaw } from "vue-router"
import NProgress from "nprogress"
import 'nprogress/nprogress.css'
import { useAppStore } from "@/store/modules/app"
//import spatial  from '@/views/spatial/spatial.vue'

NProgress.configure({
  easing: 'ease', // 动画方式
  speed: 2000, // 递增进度条的速度
  showSpinner: false, // 是否显示加载ico
  trickleSpeed: 200, // 自动递增间隔
  minimum: 0.3, // 更改启动时使用的最小百分比
  parent: 'body', //指定进度条的父容器
});

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/home"
  },
  {
    path: "/home",
    name: "home",
    props: true,
    component: () => import("@/views/home/home.vue")
  },
  {
    path: "/spatial",
    name: "spatial",
    props: true,
    component: () => import("@/views/spatial/spatial.vue")   // lazy loading
    //component: spatial
  }
]

const router = createRouter({
  routes,
  history: createWebHashHistory()
})


router.beforeResolve( async (to, from, next) => {
  if (to.name === "spatial") {
    NProgress.start()
    const appstore = useAppStore()
    appstore.partiallyReset()
    const sampleObj = appstore.sampleDict[appstore.sampleId]
    await appstore._initImgData(sampleObj.img)
    await appstore._initCsvData(sampleObj.csv)
    if(sampleObj?.json) {
      appstore._initJsonData(sampleObj.json)
    }
  }
  next()
})


router.afterEach(() => {
    NProgress.done()
})

export default router
