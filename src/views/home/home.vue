<template>
  <h2>{{ appstore.title }}</h2>
  <img src="~@/assets/spatial-logo.png" />
  <h3>A Lightweight & Versatile Visualization Tool for Spatial-Omics Data</h3>
  <el-button type="warning">github</el-button>

  <!--<el-button type="primary">document</el-button>-->

  <el-button type="primary"><a href="/docs/build/html/index.html">document</a></el-button>

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
        >Spatial-live is a lightweight and versatile visualization tool specifically developed for
        single cell spatial-omics data analysis, including spatial transcriptiomics and more. Its 3D
        integration of multiple layers within a single space makes it highly suitable for multi-types
        spatial data visualization. Leveraging the rendering capabilities of WebGL2 (GPU) technology,
        Spatial-live efficiently processes large datasets, offering interactivity, responsiveness, and
        a wide range of visualization effects through the stacking of multiple layers. As the saying
        goes, a picture is worth a thousand words. We firmly believe that effective data visualization
        plays a pivotal role in data exploration and interpretation, serving as a key component in
        gaining insights from complex datasets. Spatial-live represents a valuable tool for achieving
        these objectives.
      </p>
      <p class="text-left"
        >Currently, Spatial-live can acommodate four types of data elements, including categorical,
        numerical, gene heatmap, and Json geometric shapes. Each of them has correspoinding visual
        layer for data rendering (ScatterplotLayer, ColumnLayer, HeatBitmapLayer, and GeoJsonLayer).
        You may need to provide the properly formatted files as the inputs to Spatial-live, please
        refer to the manual document for more details.
      </p>
      <p class="text-left"
        >The development of Spatial-live relied on several outstanding third-party libraries, such as
        deckgl, vue3, and react framework, alongside numerous other open-source libraries that may
        not all be listed here. I am immensely grateful for the contributions of these libraries and
        the invaluable work they have provided.
      </p>

      <el-divider />

      <p class="text-left">
        http://github.com/yezhenqing/spatial-live
        <br />
        publication: under preparation
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
