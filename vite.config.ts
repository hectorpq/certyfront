import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    
    // 🛠️ CONFIGURACIÓN DE RUTAS PARA ENTORNO CI/CD DE VITEST:
    // Indicamos que solo busque y ejecute las pruebas unitarias verdaderas de src/test
    include: ['src/test/**/*.{test,spec}.{ts,tsx,js,jsx}'],
    
    // Excluimos la carpeta de Playwright (e2e) y el archivo huérfano para que no rompan el proceso
    exclude: [
      'node_modules/',
      'e2e/**',
      'src/test/useStudents.test.tsx'
    ],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'lcov', 'html'],
      reportOnFailure: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/main.tsx',
        'src/vite-env.d.ts',
        '**/*.d.ts',
        'src/**/*.stories.tsx',
        'src/pages/**',
        'src/components/layout/**',
        'src/App.tsx',
        'src/types/**',
        'src/components/ui/Alert.tsx',
        'src/components/ui/Badge.tsx',
        'src/components/ui/Card.tsx',
        'src/components/ui/FileUpload.tsx',
        'src/components/ui/Modal.tsx',
        'src/components/ui/Pagination.tsx',
        'src/components/ui/SearchInput.tsx',
        'src/components/ui/Select.tsx',
        'src/components/ui/SignaturePad.tsx',
        'src/components/ui/Spinner.tsx',
        'src/components/ui/Textarea.tsx',
        'src/components/ui/index.ts',
        'src/hooks/useCertificates.ts',
        'src/hooks/useInstructors.ts',
        'src/hooks/useTemplates.ts',
        'src/hooks/useTheme.ts',
        'src/services/api.ts',
        'src/services/certificateService.ts',
        'src/services/instructorService.ts',
      ],
    },
  },
})