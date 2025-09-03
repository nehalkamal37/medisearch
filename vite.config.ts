import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://store.medisearchtool.com', // your backend
        changeOrigin: true,
        secure: false,                // ignore bad/expired TLS in dev
        rewrite: (p) => p.replace(/^\/api/, ''),
        // 👇 make refresh/auth cookies usable on localhost
        cookieDomainRewrite: '',      // rewrites Set-Cookie: Domain=<anything> → Domain= (host-only: localhost)
        cookiePathRewrite: '/',       // defensive; ensures Set-Cookie path is /
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            // Some servers set SameSite=None;Secure only. If you’re on http://localhost,
            // cookie won’t stick. You either serve localhost over HTTPS or adjust backend.
            // This log helps you verify cookies are coming through during dev:
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) {
              // console.log('Set-Cookie from upstream:', setCookie);
            }
          });
        },
      },
    },
  },



  build: {
    rollupOptions: {
      plugins: [visualizer({ template: 'raw-data', open: false })],
      output: {
        manualChunks: {
          // Core React dependencies
          vendor: ['react', 'react-dom'],
          // Routing
          router: ['react-router-dom'],
          // State management
          redux: ['@reduxjs/toolkit', 'react-redux'],
          // UI framework
          ui: ['bootstrap', 'react-bootstrap'],
          // Internationalization
          i18n: ['i18next', 'react-i18next'],
          // Utilities
          utils: ['moment', 'react-select'],
        },
        // Optimize asset loading
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    // Optimize chunk size and loading
    chunkSizeWarningLimit: 1000,
    // Disable source maps in production for smaller bundles
    sourcemap: false,
    // Optimize CSS code splitting
    cssCodeSplit: true,
    // Disable preload hints in build
    assetsInlineLimit: 0,
    // Disable module preloading to fix preload warnings
    modulePreload: false,
  },
  resolve: {
   alias: {
     moment: 'moment/moment.js'
   },
 },
  // Optimize preload behavior
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'bootstrap'],
    exclude: ['@vitejs/plugin-react']
  },
  // Disable preload hints completely
  appType: 'spa',
  define: {
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false,
  },
  // Disable experimental features that might cause preload issues
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `/${filename}` }
      } else {
        return { relative: true }
      }
    }
  }
})
