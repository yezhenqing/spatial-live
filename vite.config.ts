import { UserConfig, ConfigEnv, loadEnv, defineConfig } from "vite"
import veauryVitePlugins from "veaury/vite/index.js"
import Icons from "unplugin-icons/vite"
import AutoImport from "unplugin-auto-import/vite"
import Components from "unplugin-vue-components/vite"
import IconsResolver from "unplugin-icons/resolver"
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"
import UnoCSS from "unocss/vite"

import path from "path"
const pathSrc = path.resolve(__dirname, "src")

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd())
  console.log("env:", env)
  return {
    resolve: {
      alias: {
        "@": pathSrc
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          additionalData: '@import "@/styles/variables.module.less";',
          javascriptEnabled: true
        }
      }
    },

    plugins: [
      veauryVitePlugins({
        type: "vue"
        // Configuration of @vitejs/plugin-vue
        // vueOptions: {...},
        // Configuration of @vitejs/plugin-react
        // reactOptions: {...},
        // Configuration of @vitejs/plugin-vue-jsx
        // vueJsxOptions: {...}
      }),

      UnoCSS(),

      AutoImport({
        // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
        imports: ["vue"],
        eslintrc: {
          enabled: false, //  Default `false`
          filepath: "./.eslintrc-auto-import.json", // Default `./.eslintrc-auto-import.json`
          globalsPropValue: true // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
        },
        resolvers: [
          // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox... (带样式)
          ElementPlusResolver(),
          // 自动导入图标组件
          IconsResolver({})
        ],
        vueTemplate: true, // 是否在 vue 模板中自动导入
        dts: path.resolve(pathSrc, "typings", "auto-imports.d.ts") //  自动导入组件类型声明文件位置，默认根目录; false 关闭自动生成
      }),

      Components({
        resolvers: [
          // 自动注册图标组件
          IconsResolver({
            prefix: "icon",
            enabledCollections: ["ep"] //@iconify-json/ep 是 Element Plus 的图标库
          }),
          // Auto register Element Plus components
          // 自动导入 Element Plus 组件
          ElementPlusResolver()
        ],

        dts: path.resolve(pathSrc, "typings", "components.d.ts")
      }),

      Icons({
        // 自动安装图标库
        autoInstall: true
      })
    ], // end of plugins

    // refer to https://dev.to/ysmnikhil/how-to-build-with-react-or-vue-with-vite-and-docker-1a3l
    server: {
      host: true,
      port: 8225,
      watch: {
        usePolling: true
      }
    }
  }
})
