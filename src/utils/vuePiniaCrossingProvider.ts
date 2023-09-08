import { useAppStore } from "@/store/modules/app"
import { createCrossingProviderForPureReactInVue } from "veaury"

const [useVueHooksInReact, VueProviderForReact] = createCrossingProviderForPureReactInVue(
  function () {
    return {
      appstore: useAppStore()
    }
  }
)

export { useVueHooksInReact, VueProviderForReact }
