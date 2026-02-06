import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          500: { value: "#2563eb" },
          600: { value: "#1d4ed8" },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)