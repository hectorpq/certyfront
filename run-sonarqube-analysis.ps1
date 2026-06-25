#!/usr/bin/env pwsh
# Script: run-sonarqube-analysis.ps1
# Propósito: Ejecutar análisis SonarQube localmente (simular Jenkins)
# Uso: .\run-sonarqube-analysis.ps1

param(
    [string]$SonarHost = "http://localhost:9001",
    [string]$SonarToken = ""
)

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔍 Análisis Local de SonarQube - CertyFront" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Step 1: Instalar dependencias
Write-Host "`n📦 Paso 1: Instalando dependencias..." -ForegroundColor Yellow
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en npm ci" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencias instaladas" -ForegroundColor Green

# Step 2: Ejecutar pruebas con cobertura
Write-Host "`n🧪 Paso 2: Ejecutando pruebas con cobertura..." -ForegroundColor Yellow
npm run test:coverage
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en pruebas" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Pruebas ejecutadas" -ForegroundColor Green

# Step 3: Verificar que coverage/lcov.info existe
Write-Host "`n📋 Paso 3: Verificando reporte de cobertura..." -ForegroundColor Yellow
if (Test-Path "coverage/lcov.info") {
    Write-Host "✅ coverage/lcov.info encontrado" -ForegroundColor Green
    $size = (Get-Item "coverage/lcov.info").Length
    Write-Host "   Tamaño: $size bytes" -ForegroundColor Gray
} else {
    Write-Host "❌ coverage/lcov.info NO encontrado" -ForegroundColor Red
    exit 1
}

# Step 4: Crear tsconfig.sonar.json
Write-Host "`n⚙️  Paso 4: Creando tsconfig.sonar.json..." -ForegroundColor Yellow
@{
    compilerOptions = @{
        moduleResolution = "node"
        target = "es2020"
        module = "esnext"
        jsx = "react-jsx"
        strict = $true
        esModuleInterop = $true
        skipLibCheck = $true
        forceConsistentCasingInFileNames = $true
    }
    include = @("src/**/*")
} | ConvertTo-Json -Depth 10 | Set-Content "tsconfig.sonar.json"
Write-Host "✅ tsconfig.sonar.json creado" -ForegroundColor Green

# Step 5: Ejecutar sonar-scanner
Write-Host "`n🔬 Paso 5: Ejecutando sonar-scanner..." -ForegroundColor Yellow

if ([string]::IsNullOrEmpty($SonarToken)) {
    Write-Host "⚠️  Variable SONAR_TOKEN no proporcionada" -ForegroundColor Yellow
    Write-Host "   Usa: `$env:SONAR_TOKEN='tu-token' antes de ejecutar el script" -ForegroundColor Gray
    $SonarToken = $env:SONAR_TOKEN
}

if ([string]::IsNullOrEmpty($SonarToken)) {
    Write-Host "❌ Error: SONAR_TOKEN requerido" -ForegroundColor Red
    Write-Host "   Instrucciones:" -ForegroundColor Yellow
    Write-Host "   1. Accede a SonarQube: $SonarHost" -ForegroundColor Gray
    Write-Host "   2. Ve a My Account → Security" -ForegroundColor Gray
    Write-Host "   3. Genera un token" -ForegroundColor Gray
    Write-Host "   4. Ejecuta: `$env:SONAR_TOKEN='tu-token'" -ForegroundColor Gray
    Write-Host "   5. Vuelve a ejecutar este script" -ForegroundColor Gray
    exit 1
}

$sonarCommand = @(
    "sonar-scanner",
    "-Dsonar.projectBaseDir=$(Get-Location)",
    "-Dsonar.host.url=$SonarHost",
    "-Dsonar.login=$SonarToken",
    "-Dsonar.projectKey=certy-frontend",
    "-Dsonar.projectName=certy-frontend",
    "-Dsonar.projectVersion=1.0",
    "-Dsonar.sources=src",
    "-Dsonar.tests=src",
    "-Dsonar.test.inclusions=src/**/*.test.ts,src/**/*.test.tsx",
    "-Dsonar.typescript.tsconfigPaths=tsconfig.sonar.json",
    "-Dsonar.javascript.lcov.reportPaths=coverage/lcov.info",
    "-Dsonar.sourceEncoding=UTF-8"
) -join " "

Write-Host "   Comando: $sonarCommand" -ForegroundColor Gray
Invoke-Expression $sonarCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ sonar-scanner ejecutado exitosamente" -ForegroundColor Green
} else {
    Write-Host "⚠️  sonar-scanner finalizó con código: $LASTEXITCODE" -ForegroundColor Yellow
}

# Step 6: Limpiar
Write-Host "`n🧹 Paso 6: Limpiando archivos temporales..." -ForegroundColor Yellow
Remove-Item "tsconfig.sonar.json" -ErrorAction SilentlyContinue
Write-Host "✅ Limpieza completada" -ForegroundColor Green

# Step 7: Mostrar resultados
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 Análisis Completado" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "`n📈 Revisa los resultados en:" -ForegroundColor Yellow
Write-Host "   → SonarQube Dashboard: $SonarHost/dashboard?id=certy-frontend" -ForegroundColor Cyan
Write-Host "   → Reporte Local: coverage/lcov-report/index.html" -ForegroundColor Cyan
Write-Host ""
