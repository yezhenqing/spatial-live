import { ScatterplotLayer, ColumnLayer, BitmapLayer, GeoJsonLayer } from "deck.gl"
import chroma from "chroma-js"
import {
  map as _lod_map,
  sumBy as _lod_sumBy,
  mergeWith as _lod_mergeWith,
  isArray as _lod_isArray
} from "lodash-es"
import { density2d } from "fast-kde"
import { buildPalette, Base64ToImage2 } from "@/utils/heatmap"

interface ILayerConfig {
  id: string
  reversal: boolean
  visible: boolean
  opacity: number
  z_height: number
  radius: number
  colors: object
}

const defaultConfig = {
  id: "deck-layer-base",
  reversal: false,
  visible: true,
  opacity: 0.8,
  z_height: 0,
  radius: 6,
  colors: {}
}

function createLayerConfig(id: string, options?: object): ILayerConfig {
  const config = {
    ...defaultConfig,
    ...{ id: id },
    ...options
  }
  return config
}

function createLayerInstance(p_config, p_csvdata, p_imgdata, p_jsondata, p_viewmode) {
  let _layer = undefined
  const [pre, suf] = p_config.id.split(":")
  switch (pre) {
    case "char":
      _layer = _createScatterplotLayer(p_config, p_csvdata)
      break
    case "num":
      _layer = _createColumnLayer(p_config, p_csvdata)
      break
    case "gene":
      _layer = _createHeatBitmapLayer(p_config, p_csvdata, p_imgdata, p_viewmode)
      break
    case "json":
      _layer = _createGeoJsonLayer(p_config, p_csvdata, p_jsondata)
      break
    default:
      break
  }
  return _layer
}

function _createScatterplotLayer(p_config, p_data) {
  const colorF = (o) => {
    return chroma(p_config?.colors[o]).rgb()
  }
  const _layer = new ScatterplotLayer({
    id: p_config.id,
    data: p_data,
    opacity: p_config.opacity,
    visible: p_config.visible,
    pickable: p_config?.tooltip,
    stroked: true,
    filled: true,
    radiusScale: 1,
    getPosition: (d) => [
      d["pos:pixel_x"],
      d["pos:pixel_y"],
      p_config.z_height * (p_config.reversal ? -1 : 1)
    ],
    getRadius: (d) => p_config.radius,
    getFillColor: (d) => colorF(d[p_config.id]),
    getLineColor: (d) => [0, 0, 0],
    updateTriggers: {
      getPosition: [p_config.z_height, p_config.reversal],
      getFillColor: [colorF],
      getRadius: [p_config.radius]
    }
  })
  //console.log("_layer:", _layer)
  return _layer
}

function _createColumnLayer(p_config, p_data) {
  const colorScaler = p_config.colors
  const colorF = (o) => {
    return colorScaler.evaluate(o, "rgb")
  }
  const _layer = new ColumnLayer({
    id: p_config.id,
    data: p_data,
    opacity: p_config.opacity,
    visible: p_config.visible,
    radius: p_config.radius,
    extruded: true,
    pickable: p_config?.tooltip,
    elevationScale: (p_config.z_height * (p_config.reversal ? -1 : 1)) / colorScaler.max,
    getPosition: (d) => [d["pos:pixel_x"], d["pos:pixel_y"]],
    getFillColor: (d) => colorF(d[p_config.id]),
    getLineColor: [0, 0, 0],
    getElevation: (d) => d[p_config.id],
    updateTriggers: {
      getFillColor: [colorF]
    }
  })
  return _layer
}

function _createGeoJsonLayer(p_config, p_data, p_json) {
  const colorF = (o) => {
    let fcolor = chroma('#FFFFFF').rgb()
    //if(o["properties"]?.fillcolor) {
    //  fcolor = chroma(o["properties"].fillcolor).rgb()
    //} else {
      const grp = o["properties"].group
      fcolor = chroma(p_config?.colors[grp]).rgb()
    //}
    return fcolor
  }
  const jkey = p_config.id.split(":").pop()

  const zindexdata = async (paramz) => {
    const oridata = p_json[jkey]

    function customizer(objValue, srcValue, key) {
      if (key === "coordinates" && _lod_isArray(srcValue)) {
        return srcValue.map((it) => it.map((iit) => iit.concat(objValue)))
      }
    }
    const newfts = oridata?.features.map((fo) => {
      const zobj = { geometry: { coordinates: [paramz] } }
      const updatedFO = _lod_mergeWith(zobj, fo, customizer)
      return updatedFO
    })

    return { features: newfts, type: "FeatureCollection" }
  }

  const _layer = new GeoJsonLayer({
    id: p_config.id,
    data: zindexdata(p_config.z_height * (p_config.reversal ? -1 : 1)),
    opacity: p_config.opacity,
    visible: p_config.visible,
    pickable: p_config?.tooltip,
    filled: true,
    getFillColor: (d) => colorF(d), //d is the Feature object
    //extruded: true,
    //getElevation: () => p_config.z_height * (p_config.reversal ? -1 : 1),
    updateTriggers: {
      getFillColor: [colorF]
      //getElevation: [p_config.z_height, p_config.reversal ],
    }
  })
  return _layer
}

function _createHeatBitmapLayer(p_config, p_data, p_img, p_viewmode) {
  const IMG_WIDTH = p_img.width
  const IMG_HEIGHT = p_img.height

  const _layer = new BitmapLayer({
    id: p_config.id,
    image: geneHeatBitmap(p_config, p_data, IMG_WIDTH, IMG_HEIGHT),
    bounds: [
      [0, 0, p_config.z_height * (p_config.reversal ? -1 : 1)],
      [0, IMG_HEIGHT, p_config.z_height * (p_config.reversal ? -1 : 1)],
      [IMG_WIDTH, IMG_HEIGHT, p_config.z_height * (p_config.reversal ? -1 : 1)],
      [IMG_WIDTH, 0, p_config.z_height * (p_config.reversal ? -1 : 1)]
    ],
    opacity: p_config.opacity,
    visible: p_config.visible,
    //getPolygonOffset: ({layerIndex}) => { console.log("LayerIndex:", layerIndex); return [ 1 , layerIndex * 50 ] },
    //parameters: { depthTest: false },
    // parameters: { blend: true },
    //updateTriggers: {
    //  image: [p_config.opacity, p_config.colors.brewer],
    //}
  })
  return _layer
}

const COLOR_SIZE = 30;

const geneHeatBitmap = async (p_config, p_data, W, H) => {
  const sumW = _lod_sumBy(p_data, p_config.id)
  const points = _lod_map(p_data, (o) => {
    return {
      u: o["pos:pixel_x"],
      v: o["pos:pixel_y"],
      w: o[p_config.id] / sumW
    }
  })

  const d2 = density2d(points, {
    x: "u",
    y: "v",
    weight: "w",
    adjust: 0.75,
    extent: [
      [0, W],
      [0, H]
    ],
    bins: [W, H]
  })

  const scaler = chroma.scale(p_config.colors.brewer)
  const maxopi = p_config.opacity
  const colorF = (o) => {
    //return scaler(o).alpha(o).css()
    return scaler(o).alpha(o * maxopi).css()
  }

  const _geneheatmap = d2.heatmap({ color: colorF, maxColors: COLOR_SIZE })

  return _geneheatmap
}


export { createLayerConfig, createLayerInstance }
