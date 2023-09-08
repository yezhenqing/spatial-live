<template>
  <div class="nav-menu">
    <div class="logo">
      <img src="~@/assets/spatial-favicon.png" v-if="!collapse" />
      <span @click="goHome" v-if="!collapse">Spatial-Live</span>
      <icon-ep-fold v-if="!collapse" @click="onFold" />
      <icon-ep-expand v-else @click="onFold" />
    </div>

    <el-menu v-for="(pv, pk) in appstore.menus" :key="pk" :collapse="collapse">
      <el-sub-menu v-if="pv" index="{{pk}}">
        <template #title>
          <el-icon><component :is="`${menuInfoDict[pk].icon}`" /></el-icon>
          <span> {{ menuInfoDict[pk].label }} </span>
        </template>

        <el-menu-item
          v-for="mv in pv"
          :key="mv"
          :index="pk + ':' + mv"
          @click="handleMenuItemClick"
          :style="{
            'background-color': activeMenuItem === pk + ':' + mv ? 'rgb(252, 211, 77)' : ''
          }"
        >

          <el-checkbox-group
            v-model="appstore._store_layerids"
            @change="handleCheckedLayersChange($event, pk + ':' + mv)"
            @click.native.stop
          >
            <el-checkbox :key="mv" :label="pk + ':' + mv">
              {{ mv }}
            </el-checkbox>
          </el-checkbox-group>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script lang="ts">
import router from "@/router"
import { inject } from "vue"
import { useAppStore } from "@/store/modules/app"
import {
  Menu as MenuIcon,
  Histogram as HistIcon,
  Picture as PicIcon,
  Location as LocIcon
} from "@element-plus/icons-vue"
import { forIn as _lod_forIn } from "lodash-es"
import { ColorScaler } from "@/utils/colorSchema"

export default defineComponent({
  components: {
    LocIcon,
    MenuIcon,
    HistIcon,
    PicIcon
  },

  setup() {
    const appstore = useAppStore()
    const vGUI = inject("provider_DatGUI_")

    const collapse = ref(false)

    const menuInfoDict = {
      char: { label: "Categorial Variable", icon: "MenuIcon" },
      num: { label: "Numerical Variable", icon: "HistIcon" },
      gene: { label: "Gene Heatmap", icon: "PicIcon" },
      json: { label: "GeoJson", icon: "LocIcon" }
    }

    let activeMenuItem = ref("")
    let activeFolder = ref(undefined)

    return {
      appstore,
      vGUI,
      collapse,
      menuInfoDict,

      activeMenuItem,
      activeFolder
    }
  },

  methods: {
    goHome() {
      router.push("/home")
    },

    onFold() {
      this.collapse = !this.collapse
      this.appstore.asidebar_width = !this.collapse ? "210px" : "60px"
    },

    handleCheckedLayersChange(ev, param) {
      if (ev.includes(param)) {
        this.activeMenuItem = param
        this.appstore.genLayerConfig(param)
        this.appstore.setActiveId(param)

        if (this.activeFolder) {
          if (this.activeFolder.name !== param) {
            this.vGUI.removeFolder(this.activeFolder)
            this.activeFolder = undefined
          }
        }
        if (!this.activeFolder) {
          this._createGUIFolder(param)
        }
      } else if (ev.length > 0) {
        this.appstore.delLayerConfig(param)
        this.activeMenuItem = ev[ev.length - 1]
        this.appstore.setActiveId(this.activeMenuItem)

        if (this.activeFolder) {
          if (this.activeFolder.name !== this.activeMenuItem) {
            this.vGUI.removeFolder(this.activeFolder)
            this.activeFolder = undefined
          }
        }
        if (!this.activeFolder) {
          this._createGUIFolder(this.activeMenuItem)
        }
      } else {
        this.appstore.delLayerConfig(param)
        this.activeMenuItem = ""
        this.appstore.setActiveId(this.activeMenuItem)

        if (this.activeFolder) {
          this.vGUI.removeFolder(this.activeFolder)
          this.activeFolder = undefined
        }
      }
    },

    handleMenuItemClick(el) {
      if (this.appstore._store_layerids.includes(el.index)) {
        this.activeMenuItem = el.index
        this.appstore.setActiveId(el.index)

        if (this.activeFolder) {
          if (this.activeFolder.name !== this.activeMenuItem) {
            this.vGUI.removeFolder(this.activeFolder)
            this.activeFolder = undefined
          }
        }
        if (!this.activeFolder) {
          this._createGUIFolder(this.activeMenuItem)
        }
      }
    },

    _createGUIFolder(activeItem: string) {
      const config = this.appstore?.active_config
      if (activeItem === config.id) {
        const [pre, suf] = config.id.split(":")
        this.activeFolder = this.vGUI.addFolder(config.id)
        this.activeFolder.add(config, "z_height", 0, this.appstore.MAXZ, 1)
        this.activeFolder.add(config, "opacity", 0, 1, 0.01).name("layer opacity")
        this.activeFolder.add(config, "reversal")
        this.activeFolder.add(config, "visible")

        if(activeItem.startsWith("char:") || activeItem.startsWith("num")) {
          this.activeFolder.add(config, "radius", 1, 20, 1)
        }

        if ("tooltip" in config) {
          this.activeFolder.add(config, "tooltip")
        }

        if ("colors" in config) {
          // a little bit messy for color manager, may need to improve it later
          const colorFolder = this.activeFolder.addFolder("colors")
          let local_colorMap = config.colors
          if (local_colorMap instanceof ColorScaler) {
            const brewerOptions = {
              schema: local_colorMap.brewer
            }
            colorFolder
              .add(brewerOptions, "schema", {
                Grays:    "Greys",
                Purples:  "Purples",
                Blues:     "Blues",
                Greens:    "Greens",
                Oranges:   "Oranges",
                Reds:      "Reds",
                YlOrBr:    "YlOrBr",
                YlOrRd:    "YlOrRd",
                OrRd:      "OrRd",
                PuRd:      "PuRd",
                RdPu:      "RdPu",
                BuPu:      "BuPu",
                GnBu:      "GnBu",
                PuBu:      "PuBu",
                YlGnBu:    "YlGnBu",
                PuBuGn:    "PuBuGn",
                BuGn:      "BuGn",
                YlGn:      "YlGn",
                RdBu:      "RdBu",
                Spectral: "Spectral",
              })
              .onChange((v) => {
                config.colors.setBrewer(v)
              })
          } else {
            _lod_forIn(local_colorMap, (v, k) => {
              colorFolder.addColor(local_colorMap, k)
            })
          }
        }
        this.activeFolder.open()
      }
    }
  }
})

</script>

<style scoped lang="less">
.nav-menu {
  height: 100%;
  background-color: #001529;

  .logo {
    display: flex;
    height: 36px;
    padding: 12px 3px 8px 10px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    .img {
      height: 30;
      margin: 0 10px;
    }
  }

}
</style>



