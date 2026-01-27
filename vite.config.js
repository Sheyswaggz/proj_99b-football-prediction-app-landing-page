import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * Vite Configuration for Football Prediction Landing Page
 * 
 * This configuration provides:
 * - Optimized development server with HMR
 * - Production build optimizations
 * - Asset handling and optimization
 * - HTML minification
 * - Code splitting and chunking strategies
 * 
 * @see https://vitejs.dev/config/
 */
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';

  return {
    // Base public path when served in development or production
    base: './',

    // Project root directory
    root: './',

    // Directory to serve as plain static assets
    publicDir: 'public',

    // Development server configuration
    server: {
      port: 3000,
      host: true,
      open: true,
      strictPort: false,
      cors: true,
      hmr: {
        overlay: true,
      },
      watch: {
        usePolling: false,
      },
    },

    // Preview server configuration (for production build preview)
    preview: {
      port: 4173,
      host: true,
      strictPort: false,
      open: true,
      cors: true,
    },

    // Build configuration
    build: {
      // Output directory for production build
      outDir: 'dist',
      
      // Directory for assets relative to outDir
      assetsDir: 'assets',
      
      // Static asset handling
      assetsInlineLimit: 4096, // 4kb - inline assets smaller than this as base64
      
      // CSS code splitting
      cssCodeSplit: true,
      
      // Generate source maps for production
      sourcemap: isProduction ? false : true,
      
      // Minification options
      minify: isProduction ? 'terser' : false,
      
      // Terser minification options
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
          pure_funcs: isProduction ? ['console.log', 'console.info'] : [],
          passes: 2,
        },
        format: {
          comments: false,
        },
        mangle: {
          safari10: true,
        },
      },
      
      // Rollup options for advanced bundling configuration
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          // Manual chunk splitting for better caching
          manualChunks: (id) => {
            // Vendor chunk for node_modules
            if (id.includes('node_modules')) {
              // Split large libraries into separate chunks
              if (id.includes('chart.js') || id.includes('chartjs')) {
                return 'vendor-charts';
              }
              if (id.includes('gsap') || id.includes('animation')) {
                return 'vendor-animations';
              }
              return 'vendor';
            }
          },
          
          // Asset file naming
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            
            if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp)$/i.test(assetInfo.name)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            
            if (ext === 'css') {
              return `assets/css/[name]-[hash][extname]`;
            }
            
            return `assets/[name]-[hash][extname]`;
          },
          
          // Chunk file naming
          chunkFileNames: 'assets/js/[name]-[hash].js',
          
          // Entry file naming
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
      },
      
      // Chunk size warning limit (in kbs)
      chunkSizeWarningLimit: 1000,
      
      // Enable/disable CSS minification
      cssMinify: isProduction,
      
      // Build target
      target: 'es2015',
      
      // Enable/disable reporting compressed size
      reportCompressedSize: isProduction,
      
      // Emit assets during build
      emptyOutDir: true,
    },

    // CSS configuration
    css: {
      devSourcemap: isDevelopment,
      preprocessorOptions: {
        scss: {
          additionalData: '',
        },
      },
    },

    // Dependency optimization
    optimizeDeps: {
      include: [],
      exclude: [],
      esbuildOptions: {
        target: 'es2015',
      },
    },

    // Plugin configuration
    plugins: [],

    // Path resolution
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@assets': resolve(__dirname, './src/assets'),
        '@components': resolve(__dirname, './src/components'),
        '@utils': resolve(__dirname, './src/utils'),
        '@styles': resolve(__dirname, './src/styles'),
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },

    // Environment variables configuration
    envPrefix: 'VITE_',

    // Enable esbuild for faster builds
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
      legalComments: 'none',
      target: 'es2015',
    },

    // JSON handling
    json: {
      namedExports: true,
      stringify: false,
    },

    // Log level
    logLevel: isDevelopment ? 'info' : 'warn',

    // Clear screen on rebuild
    clearScreen: true,
  };
});