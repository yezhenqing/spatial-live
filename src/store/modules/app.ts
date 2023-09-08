import { acceptHMRUpdate, defineStore } from "pinia"
import { CSVLoader } from "@loaders.gl/csv"
import { ImageLoader } from "@loaders.gl/images"
//import { JSONLoader } from "@loaders.gl/json"
import { load } from "@loaders.gl/core"
import {
  uniqBy as _lod_uniqBy,
  minBy as _lod_minBy,
  maxBy as _lod_maxBy,
  meanBy as _lod_meanBy,
  filter as _lod_filter
} from "lodash-es"
import _ from "lodash-es"
import { randomColors, ColorScaler } from "@/utils/colorSchema"
import { createLayerConfig } from "@/utils/layerGenerator"

interface IAppState {
  _initialized: boolean
  title: string
  asidebar_width: string

  _store_layerids: string[]
  _layers_config: object

  viewmode: string
  imgname: string
  imgopacity: number

  activeId: string

  sampleDict: object
  sampleId: string

  csvdata: any
  imgdata: any
  jsondata: any
  MAXZ: number
  _layers_meta_info: object
}

interface IMenu {
  char: string[]
  num: string[]
  gene: string[]
  json: string[]
}


export const useAppStore = function () {
  const innerStore = defineStore("app", {
    state: (): IAppState => {
      return {
        _initialized: false,
        asidebar_width: "210px",
        title: import.meta.env.VITE_APP_TITLE,

        _store_layerids: [], //for the nav-menu.vue checkboxgroup v-model

        viewmode: "Ortho", //Orbit
        imgname: "spatial-live.png",
        imgopacity: 1.0,

        sampleDict: {
          "kidney-demo": {
            csv: "/quickdemo/kidney/output/kidney_demo.csv",
            img: "/quickdemo/kidney/output/kidney_demo.png",
            json: "/quickdemo/kidney/output/json/"
          },
          //"liver-demo": {
          //  csv: "/quickdemo/liver/output/liver_demo.csv",
          //  img: "/quickdemo/liver/output/liver_demo.png",
          //  json: ""
          //}
        },
        sampleId: "kidney-demo",

        activeId: "",
        _layers_config: {},

        MAXZ: 0,

        // non-reactive
        csvdata: markRaw({}),
        imgdata: markRaw({}),
        jsondata: markRaw({}),

        // to save meta information for each layer
        _layers_meta_info: markRaw({})
      }
    },

    getters: {
      menus(): IMenu {
        const menus = { char: [], num: [], gene: [], json: [] }
        if (this.csvdata.length > 0) {
          const firstrow = this.csvdata[0]
          const mkeys = Object.keys(firstrow)
          mkeys.map((o) => {
            const [pre, suf] = o.split(":") as string[]
            switch (pre) {
              case "char":
              case "num":
              case "gene":
                menus[pre].push(suf)
                break
              default:
                break
            }
          })
        }

        if (Object.keys(this.jsondata).length > 0) {
          const jkeys = Object.keys(this.jsondata)
          jkeys.map((o) => {
            menus["json"].push(o)
          })
        }
        return menus
      },

      active_config(): object {
        let _config = undefined
        if (this.activeId !== "") {
          if (this.activeId in this._layers_config) {
            _config = this._layers_config[this.activeId]
          }
        }
        return _config
      }
    },

    actions: {
      async _initCsvData(csv_url: string) {
        this.csvdata = await load(csv_url, CSVLoader, { csv: { header: true }, worker: true })
        Object.keys(this.menus).map((k) => {
          switch (k) {
            case "char": {
              for (const v of this.menus[k]) {
                const itK = k + ":" + v
                const uniqobjs = _lod_uniqBy(this.csvdata, (o) => o[itK])
                const uniqlabels = uniqobjs.map((o) => o[itK]).sort()
                const colormap = randomColors(uniqlabels)

                if (!(itK in this._layers_meta_info)) {
                  this._layers_meta_info[itK] = {}
                }
                Object.assign(this._layers_meta_info[itK], { colors: colormap })
              }
              break
            }

            case "num": {
              for (const v of this.menus[k]) {
                const itK = k + ":" + v
                const [nzminval, nzmeanval, maxval] = this.__columnStats(this.csvdata, itK)
                const colorScaler = new ColorScaler(nzminval, nzmeanval, maxval)
                if (!(itK in this._layers_meta_info)) {
                  this._layers_meta_info[itK] = {}
                }
                Object.assign(this._layers_meta_info[itK], { colors: colorScaler })
              }
              break
            }

            case "gene": {
              for (const v of this.menus[k]) {
                const itK = k + ":" + v
                const [nzminval, nzmeanval, maxval] = this.__columnStats(this.csvdata, itK)
                const colorScaler = new ColorScaler(nzminval, nzmeanval, maxval)
                if (!(itK in this._layers_meta_info)) {
                  this._layers_meta_info[itK] = {}
                }
                Object.assign(this._layers_meta_info[itK], { colors: colorScaler })
              }
              break
            }

            default:
              break
          }
        })
      },

      __columnStats(oArray: [], cid: string) {
        const nzminobj = _lod_minBy(
          _lod_filter(oArray, function (o) {
            return o[cid] > 0
          }),
          (o) => o[cid]
        )
        const nzmeanval = _lod_meanBy(
          _lod_filter(oArray, function (o) {
            return o[cid] > 0
          }),
          (o) => o[cid]
        )
        const maxval = _lod_maxBy(oArray, (o) => o[cid])

        return [nzminobj[cid], nzmeanval, maxval[cid]]
      },

      async _initImgData(img_url: string) {
        this.imgdata = await load(img_url, ImageLoader)
        this.MAXZ = Math.floor(0.75 * Math.max(this.imgdata.width, this.imgdata.height))
      },


      async _initJsonData(json_url: string) {
        if(json_url.startsWith("/quickdemo/kidney/")) {
          this.jsondata = import.meta.glob("/quickdemo/kidney/output/json/*.json", {
            import: "default",
            eager: true
          })
        } else if (json_url && !json_url.startsWith("/quickdemo/")) {
          //const jsondirs = import.meta.glob("/public/data/**/json/*.json", {
          const jsondirs = import.meta.glob("/src/data/**/json/*.json", {
            import: "default",
            eager: true
          })

          this.jsondata = _.pickBy(jsondirs, function (v, k) {
            return k.startsWith(json_url)
          })
        }

        if (Object.keys(this.jsondata).length > 0) {
          const jkeys = Object.keys(this.jsondata)
          jkeys.map((o) => {
            const itemkey = o.split("/").pop()?.replace(".json", "")
            const itemval = this.jsondata[o]
            this.jsondata[itemkey] = itemval
            delete this.jsondata[o]
          })
        }

        this.menus?.json?.map((k) => {
          const features = this.jsondata[k]?.features

          if (features) {
            const uniqgrps = _lod_uniqBy(features, (o) => o["properties"].group)
            const grplabels = uniqgrps.map((o) => o["properties"].group).sort()
            const colormap = randomColors(grplabels)
            const layerkey = "json:" + k
            if (!(layerkey in this._layers_meta_info)) {
              this._layers_meta_info[layerkey] = {}
            }
            Object.assign(this._layers_meta_info[layerkey], { colors: colormap })
          }
        })
      },

      updateGuiParamState(key, val) {
        return Object.assign(this.$state, { key: val })
      },

      setActiveId(item: string) {
        this.activeId = item
      },

      genLayerConfig(addId: string) {
        if (!(addId in this._layers_config)) {
          const cfg_options = { colors: this._layers_meta_info[addId]?.colors }

          if (!addId.startsWith("gene:")) {
            Object.assign(cfg_options, { tooltip: false })
          }

          const config = createLayerConfig(addId, cfg_options)
          this._layers_config[addId] = config
        }
      },

      delLayerConfig(delId: string) {
        if (delId in this._layers_config) {
          delete this._layers_config[delId]
        }
      },

      partiallyReset() {
        this.activeId = ""
        this._layers_config = {}
        this._store_layerids = []
        this.viewmode = "Ortho"
        this.imgopacity = 1.0
      }
    }
  })

  const appStore = innerStore()
  // Make sure we only register the listener once
  if (!appStore._initialized) {
    //const dir_glob = import.meta.glob("/public/data/**/*.csv")
    const dir_glob = import.meta.glob("/src/data/**/*.csv")
    Object.keys(dir_glob).map((k: String) => {
      //const ms = k.match("/public/data/[a-zA-Z]+/")
      const ms = k.match("/src/data/[a-zA-Z-_]+/")
      if (ms) {
        const sid = _.last(_.compact(ms[0].split("/")))
        appStore.sampleDict[sid] = {
          csv: ms.input,
          img: ms.input.replace(".csv", ".png"),
          json: ms[0] + "json/"
        }
      }
    })
    appStore._initialized = true
  }

  if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(innerStore, import.meta.hot))
  }

  return appStore
}
