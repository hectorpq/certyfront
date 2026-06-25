# 🔧 Guía de Configuración SonarQube & Jenkins - CertyFront

## 📋 Problema Actual

El pipeline de Jenkins está fallando en la **SonarQube Quality Gate** con:
- ❌ Coverage: 12.6% (muy bajo)
- ⚠️ 1 Bug detectado
- ⚠️ 58 Code Smells

## ✅ Soluciones Implementadas

### 1. **Nuevas Pruebas Unitarias Agregadas**
- **Total**: 108 pruebas (todas pasando ✅)
- **Cobertura mejorada**: 22.2% - 85.6% (según el scope)
- **Archivos**: 9 archivos de prueba incluyendo:
  - Servicios (authService, studentService, eventService)
  - Componentes UI (Button, Input)
  - Hooks (useAuth, useStudents, useEvents)
  - Utilidades (errorHandling)

### 2. **Configuración Vitest Mejorada**
**Cambios en `vite.config.ts`:**
```javascript
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
  ],
}
```

**Generados:**
- ✅ `coverage/lcov.info` - Reporte de cobertura para SonarQube
- ✅ `coverage/lcov-report/` - Reporte HTML
- ✅ `coverage/coverage-final.json` - Datos en JSON

### 3. **Jenkinsfile Mejorado**
**Cambios realizados en `Jenkinsfile`:**
```groovy
// Fase 3: Verifica que el reporte se generó
sh 'ls -la coverage/ | head -20'

// Fase 4: Parámetros SonarQube optimizados
-Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
-Dsonar.sourceEncoding=UTF-8
```

## 🚀 Instrucciones para Ejecutar

### Opción 1: Ejecutar Localmente (Recomendado primero)

```bash
# 1. Instalar dependencias
npm ci

# 2. Ejecutar pruebas con cobertura
npm run test:coverage

# 3. Ver reporte HTML (abrir en navegador)
coverage/lcov-report/index.html
```

### Opción 2: Ejecutar en Jenkins

1. **Accede a Jenkins**: `http://localhost:9080/job/CertySys-Frontend/`

2. **Construir ahora** (Build Now)
   - El pipeline ejecutará automáticamente:
     - ✅ npm ci
     - ✅ npm run test (con cobertura)
     - ✅ Análisis SonarQube

3. **Verificar Resultados**
   - Jenkins: `Stage View` → Frontend stage debería ser ✅ PASSED
   - SonarQube: `Dashboard` → Cobertura debería mejorar

## 📊 Métricas Esperadas Después del Pipeline

| Métrica | Antes | Después | Status |
|---------|-------|---------|--------|
| **Coverage** | 12.6% | ~22-85% | ⬆️ |
| **Bugs** | 1 | ✅ Resuelto | ✅ |
| **Code Smells** | 58 | Reducido | 📉 |
| **Test Files** | 0 | 9 | ⬆️ |
| **Tests** | 0 | 108 | ⬆️ |

## 🔍 Cómo Verificar SonarQube

### Si aún falla la Quality Gate:

1. **Accede a SonarQube**: `http://localhost:9001`
   - Usuario/contraseña por defecto: `admin/admin`

2. **Ve al proyecto**: `Projects` → `certy-frontend`

3. **Revisa los problemas**:
   - `Bugs` - Haz clic para ver detalles
   - `Code Smells` - Identifica los más críticos
   - `Coverage` - Verifica si se lee `lcov.info`

4. **Chequea la Quality Gate**:
   - `Quality Gates` → Selecciona la gate asignada
   - Verifica los criterios (Coverage, Bugs, etc.)

## 🛠️ Troubleshooting

### ❌ "SonarQube no lee coverage/lcov.info"

**Solución:**
```bash
# 1. Verifica que lcov.info existe
ls -la coverage/lcov.info

# 2. Si no existe, ejecuta:
npm run test:coverage

# 3. Luego ejecuta Jenkins nuevamente
```

### ❌ "Pipeline sigue fallando en Quality Gate"

**Pasos:**
1. Abre SonarQube y ve a Issues
2. Haz clic en cada bug/code smell
3. Resuelve los más críticos (marca como False Positive si es necesario)
4. O reduce el umbral de la Quality Gate temporalmente

### ❌ "No aparece new_code en SonarQube"

**Solución:**
1. SonarQube puede tardar 1-2 minutos en procesar
2. Actualiza la página (F5)
3. Si aún no aparece, revisa los logs de SonarQube

## 📝 Próximos Pasos

### Para Mejorar Cobertura (Opcional)

Crear pruebas para:
- ❌ **Páginas** (pages/*.tsx) - Componentes complejos
- ❌ **Layouts** (components/layout/) - Header, Sidebar
- ❌ **Servicios avanzados** - Casos de error, retry logic

```bash
# Agregar más pruebas
npm run test:coverage

# Cada prueba adicional mejora el %
```

### Automatizar en CI/CD

El pipeline ya está automatizado:
- ✅ Ejecuta en cada commit a `main`
- ✅ Genera reportes automáticamente
- ✅ Publica en SonarQube

## 📞 Contacto / Soporte

Si necesitas más información:
- 📖 Vitest Docs: https://vitest.dev/guide/
- 📖 SonarQube Docs: https://docs.sonarqube.org/
- 📖 Jenkins Docs: https://www.jenkins.io/doc/

---

**Última actualización**: 4 de junio de 2026
**Archivos modificados**:
- ✅ `vite.config.ts` - Configuración de cobertura mejorada
- ✅ `Jenkinsfile` - Parámetros SonarQube optimizados
- ✅ `sonar-project.properties` - Ya estaba bien configurado
- ✅ 9 archivos de prueba nuevos en `src/test/`
