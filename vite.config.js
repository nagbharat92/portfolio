import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages deployment:
  // Replace '<REPO_NAME>' with your actual GitHub repository name.
  // Example: base: '/personal-website/'
  // For custom domains, set base: '/'
  // In dev mode, base is automatically '/' so local dev always works.
  base: process.env.NODE_ENV === 'production' ? '/<REPO_NAME>/' : '/',
})
