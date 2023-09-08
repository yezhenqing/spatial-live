<template>
  <div class="main">
    <el-container class="main-content">
      <!--<el-aside width="210px">-->
      <el-aside :width="appstore.asidebar_width">
        <nav-menu />
      </el-aside>
      <el-container class="page">
        <el-main class="page-content">
          <VueProviderForReact>
            <ReactDeckPanel></ReactDeckPanel>
          </VueProviderForReact>
        </el-main>
      </el-container>
    </el-container>
  </div>

  <div id="vgui" ref="vgui"></div>
</template>

<script lang="ts">
import { useAppStore } from "@/store/modules/app"
import NavMenu from "@/layout/nav-menu.vue"
import * as dat from "dat.gui"
import { provide } from "vue"
import { applyPureReactInVue } from "veaury"
import { VueProviderForReact } from "@/utils/vuePiniaCrossingProvider"
import ReactDeckPanel from "@/react_app/ReactDeckPanel.jsx"

export default defineComponent({
  components: {
    NavMenu,
    VueProviderForReact,
    ReactDeckPanel: applyPureReactInVue(ReactDeckPanel)
  },

  setup() {
    const vGUI = new dat.GUI({ autoPlace: false })
    const appstore = useAppStore()
    provide("provider_DatGUI_", vGUI)

    return {
      vGUI,
      appstore
    }
  },

  mounted() {
    this._setupDatGUI()
    this.$refs.vgui.append(this.vGUI.domElement)
  },

  methods: {
    _setupDatGUI() {
      this.vGUI
        .add(this.appstore, "viewmode", { Ortho: "Ortho", Orbit: "Orbit" })
        .onChange((val: string) => {
          this.appstore.updateGuiParamState("viewmode", val)
        })

      this.vGUI
        .add(this.appstore, "imgname")
        .name("image name")
        .onChange((val: string) => {
          this.appstore.updateGuiParamState("imgname", val)
        })

      this.vGUI
        .add(this.appstore, "imgopacity", 0, 1, 0.01)
        .name("image opacity")
        .onChange((val: number) => {
          this.appstore.updateGuiParamState("imgopacity", val)
        })
    }
  }
})
</script>

<style scoped lang="less">
#vgui {
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 100;
}

.main {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.main-content,
.page {
  height: 100%;
}

.page-header {
  border-bottom: 1px solid gray;
  background-color: rgb(201, 77, 68);
}
.page-content {
  /* height: calc(100%-36px); */
  height: 100%;
  /* background-color: rgb(237, 232, 232); */
  background-color: rgb(255, 255, 255);
}

.el-header,
.el-footer {
  display: flex;
  color: #333;
  text-align: center;
  align-items: center;
}

/*
.el-header {
  height: 36px !important;
}
*/

.el-aside {
  overflow-x: hidden;
  overflow-y: auto;
  line-height: 36px;
  text-align: left;
  cursor: pointer;
  color: #ffffff;
  background-color: gray; /*#001529; */
  transition: width 0.3s linear;
  scrollbar-width: none; /* firefox */
  -ms-overflow-style: none; /* IE 10+ */
}
</style>
