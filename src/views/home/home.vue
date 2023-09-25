<template>
  <h2>{{ appstore.title }}</h2>
  <img src="~@/assets/spatial-logo.png" />
  <h3>A Lightweight & Versatile Visualization Tool for Spatial-Omics Data</h3>
  <el-button type="warning"><a href="https://github.com/yezhenqing/spatial-live">github</a></el-button>
  <el-button type="primary"><a href="https://yezhenqing.github.io/spatial-live">document</a></el-button>

  <el-button type="success" @click="gotoSpatial">start</el-button>
  &nbsp;
  <el-select v-model="appstore.sampleId" placeholder="Select">
    <el-option
      v-for="item in Object.keys(appstore.sampleDict)"
      :key="item"
      :label="item"
      :value="item"
    />
  </el-select>

  <el-divider>
    <icon-ep-location />
  </el-divider>

  <div class="flex w-full">
    <div class="flex items-center">
      <img src="~@/assets/spatial-demo.png" class="h-110 w-130" />
    </div>
    <div class="ml-10">
      <p class="text-left"
        >Spatial-Live is a lightweight and versatile visualization tool specifically developed for
        single cell spatial-omics data analysis. Its 3D integration of multiple layers within a single 
        space makes it highly suitable for multi-types spatial data visualization. Leveraging the rendering
        capabilities of GPU-powered backend, Spatial-Live efficiently offers interactivity, responsiveness, 
        and a wide range of visualization effects. We firmly believe that effective data visualization plays 
        a pivotal role in data exploration and interpretation, serving as a key component in gaining insights
        from complex datasets. Spatial-live represents a valuable tool for achieving these objectives.
      </p>
      <p class="text-left"
        >Currently, Spatial-Live can acommodate four types of data elements, including categorical,
        numerical, gene heatmap, and Json geometric shapes. Each of them has correspoinding visual
        layer for data rendering (ScatterLayer, ColumnLayer, HeatmapLayer, and GeoJsonLayer).
        You may need to provide the properly formatted files as the inputs to Spatial-Live, please
        refer to the manual document for more details.
      </p>
      <p class="text-left"
        >The development of Spatial-Live relied on several outstanding third-party libraries, such as
        deckgl, vue3, and react framework, alongside numerous other open-source libraries that may
        not all be listed here. I am immensely grateful for the contributions of these libraries and
        the invaluable work they have provided.
      </p>

      <el-divider />

      <p class="text-left">
        <strong>Citation</strong>(preprint):
        <br />
        <strong>Spatial-Live: A lightweight and versatile tool for single cell spatial-omics data visualization</strong><br/>
        Zhenqing Ye, Zhao Lai, Siyuan Zheng, Yidong Chen<br/>
        doi: <a href="https://doi.org/10.1101/2023.09.24.559173">https://doi.org/10.1101/2023.09.24.559173</a>
      </p>
    </div>
  </div>

</template>

<script lang="ts">
import { useAppStore } from "@/store/modules/app"
import router from "@/router"

export default defineComponent({
  data() {
    return {
      title: "Home Page"
    }
  },

  setup() {
    const appstore = useAppStore()
    return {
      appstore
    }
  },

  methods: {
    gotoSpatial() {
      router.push("/spatial")
    }
  },

})
</script>
