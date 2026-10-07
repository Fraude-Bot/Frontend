/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, '.', '')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      tsconfigPaths: true,
    },
    assetsInclude: ['**/*.lottie'],
    server: {
      host: true,
      port: 80,
      proxy: {
        '/api': {
          target: environment.VITE_API_PROXY_TARGET || 'http://localhost:9000',
          changeOrigin: true,
        },
      },
      watch: {
        usePolling: true
      }
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        reportsDirectory: '.coverage',
        reporter: ['text', 'html', 'json-summary'],
        thresholds: {
          statements: 65,
          branches: 50,
          functions: 65,
          lines: 65,
        },
        include: [
          'src/core/**/*.ts',
          'src/application/**/*.ts',
          'src/infrastructure/**/*.ts',
          'src/common/**/*.ts',
          'src/presentation/shared/utils/**/*.ts',
          'src/presentation/pages/report/components/{map-graph,contact-platform,payment-method.util,contact-date.util,map-export}.ts',
        ],
        exclude: [
          'src/main.tsx',
          'src/**/*.d.ts',
          'src/test/**',
          'src/**/stub/**',
          'src/application/dependencies.ts',
          'src/infrastructure/di/**',
          'src/infrastructure/observability/**',
        ],
      },
    },
  }
})
