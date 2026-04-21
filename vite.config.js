import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change base to '/<repo-name>/' if your GitHub repo is NOT set to a custom domain.
// Example: base: '/loan-calculator/'
export default defineConfig({
  plugins: [react()],
  base: './',
})
