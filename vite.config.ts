import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // fsevents misses edits in this environment; poll so HMR stays fresh.
      usePolling: true,
      interval: 300,
    },
  },
})
