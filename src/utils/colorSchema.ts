import { sampleSize as _lod_sampleSize } from "lodash-es"
import { zipObject as _lod_zipObject } from "lodash-es"
import chroma from "chroma-js"

// refer to the code from scanpy
// https://github.com/scverse/scanpy/blob/master/scanpy/plotting/palettes.py

const palettes = {
  // from http://godsnotwheregodsnot.blogspot.de/2012/09/color-distribution-methodology.html
  godsnot_102: [
    // "#000000",  // remove the black, as often, we have black colored annotation
    "#FFFF00",
    "#1CE6FF",
    "#FF34FF",
    "#FF4A46",
    "#008941",
    "#006FA6",
    "#A30059",
    "#FFDBE5",
    "#7A4900",
    "#0000A6",
    "#63FFAC",
    "#B79762",
    "#004D43",
    "#8FB0FF",
    "#997D87",
    "#5A0007",
    "#809693",
    "#6A3A4C",
    "#1B4400",
    "#4FC601",
    "#3B5DFF",
    "#4A3B53",
    "#FF2F80",
    "#61615A",
    "#BA0900",
    "#6B7900",
    "#00C2A0",
    "#FFAA92",
    "#FF90C9",
    "#B903AA",
    "#D16100",
    "#DDEFFF",
    "#000035",
    "#7B4F4B",
    "#A1C299",
    "#300018",
    "#0AA6D8",
    "#013349",
    "#00846F",
    "#372101",
    "#FFB500",
    "#C2FFED",
    "#A079BF",
    "#CC0744",
    "#C0B9B2",
    "#C2FF99",
    "#001E09",
    "#00489C",
    "#6F0062",
    "#0CBD66",
    "#EEC3FF",
    "#456D75",
    "#B77B68",
    "#7A87A1",
    "#788D66",
    "#885578",
    "#FAD09F",
    "#FF8A9A",
    "#D157A0",
    "#BEC459",
    "#456648",
    "#0086ED",
    "#886F4C",
    "#34362D",
    "#B4A8BD",
    "#00A6AA",
    "#452C2C",
    "#636375",
    "#A3C8C9",
    "#FF913F",
    "#938A81",
    "#575329",
    "#00FECF",
    "#B05B6F",
    "#8CD0FF",
    "#3B9700",
    "#04F757",
    "#C8A1A1",
    "#1E6E00",
    "#7900D7",
    "#A77500",
    "#6367A9",
    "#A05837",
    "#6B002C",
    "#772600",
    "#D790FF",
    "#9B9700",
    "#549E79",
    "#FFF69F",
    "#201625",
    "#72418F",
    "#BC23FF",
    "#99ADC0",
    "#3A2465",
    "#922329",
    "#5B4534",
    "#FDE8DC",
    "#404E55",
    "#0089A3",
    "#CB7E98",
    "#A4E804",
    "#324E72"
  ],

  zeileis_28: [
    "#023fa5",
    "#7d87b9",
    "#bec1d4",
    "#d6bcc0",
    "#bb7784",
    "#8e063b",
    "#4a6fe3",
    "#8595e1",
    "#b5bbe3",
    "#e6afb9",
    "#e07b91",
    "#d33f6a",
    "#11c638",
    "#8dd593",
    "#c6dec7",
    "#ead3c6",
    "#f0b98d",
    "#ef9708",
    "#0fcfc0",
    "#9cded6",
    "#d5eae7",
    "#f3e1eb",
    "#f6c4e1",
    "#f79cd4",
    "#7f7f7f",
    "#c7c7c7",
    "#1CE6FF",
    "#336600"
  ],

  vega_10_scanpy: [
    "#1f77b4",
    "#ff7f0e",
    "#279e68",
    "#d62728",
    "#aa40fc",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#b5bd61",
    "#17becf"
  ],

  vega_20_scanpy: [
    "#1f77b4",
    "#ff7f0e",
    "#279e68",
    "#d62728",
    "#aa40fc",
    "#8c564b",
    "#e377c2",
    "#b5bd61",
    "#17becf",
    "#aec7e8",
    "#ffbb78",
    "#98df8a",
    "#ff9896",
    "#c5b0d5",
    "#c49c94",
    "#f7b6d2",
    "#dbdb8d",
    "#9edae5",
    "#ad494a",
    "#8c6d31"
  ]
}

function randomColors(labels: []): object {
  let colors = []
  //const colors = _lod_sampleSize(palettes.godsnot_102, labels.length)
  if (labels.length <= 10) {
    colors = _lod_sampleSize(palettes.vega_10_scanpy, labels.length)
  } else if (labels.length <= 20) {
    colors = _lod_sampleSize(palettes.vega_20_scanpy, labels.length)
  } else if (labels.length <= 28) {
    const colors = _lod_sampleSize(palettes.zeileis_28, labels.length)
  } else if (labels.length <= 102) {
    colors = _lod_sampleSize(palettes.godsnot_102, labels.length)
  } else {
    console.log("too much colors for plotting, maybe not very good...")
  }
  const colormap = _lod_zipObject(labels, colors)
  return colormap
}

class ColorScaler {
  min: number
  mean: number
  max: number
  brewer = "Blues"
  nullcolor = "#ffffff"
  zerocolor = "#ffffff"
  scaler: Function

  constructor(min: number, mean: number, max: number, brewer = "Blues") {
    this.min = min
    this.mean = mean
    this.max = max
    this.brewer = brewer
    this.scaler = chroma.scale(this.brewer).domain([min, mean, max]).nodata(this.nullcolor)
  }

  setBrewer(brewer: string) {
    this.brewer = brewer
    this.scaler = chroma
      .scale(this.brewer)
      .domain([this.min, this.mean, this.max])
      .nodata(this.nullcolor)
  }

  setZeroColor(color: string) {
    this.zerocolor = color
  }

  setNullColor(color: string) {
    this.nullcolor = color
  }


  getColorMap() {
    return {
      min: this.evaluate(this.min),
      mean: this.evaluate(this.mean),
      max: this.evaluate(this.max)
    }
  }

  evaluate(val: number, mode = "hex") {
    let color = undefined
    if (val > this.max) {
      color = this.scaler(this.max)
    } else if (val < this.min) {
      color = this.scaler(this.min)
    } else {
      color = this.scaler(val)
    }
    if (mode === "rgb") {
      color = color.rgb()
    } else if (mode === "css") {
      color = color.css()
    } else {
      color = color.hex()
    }
    return color
  }
}

export { palettes, randomColors, ColorScaler }
