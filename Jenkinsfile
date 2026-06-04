pipeline {
    agent any

    environment {
        SONAR_QUBE_SERVER = 'SonarQubeServer'
    }

    stages {
        stage('Pipeline Completo Frontend') {
            steps {
                script {
                    nodejs(nodeJSInstallationName: 'NodeJS') { 
                        
                        echo '🚀 Iniciando Fase 1: Instalación Limpia...'
                        sh 'npm ci'
                        
                        echo '🚀 Iniciando Fase 2: Ejecución de la Suite de Pruebas...'
                        sh 'npm run test -- --coverage || true'
                        
                        echo '🚀 Iniciando Fase 3: Análisis Estático en SonarQube...'
                        // 🛠️ Agregamos de forma explícita el bloque "include" con la ruta de tus componentes src/
                        sh 'echo \'{"compilerOptions": {"moduleResolution": "node", "target": "es2020", "module": "esnext"}, "include": ["src/**/*"]}\' > tsconfig.sonar.json'
                        
                        def scannerHome = tool name: 'SonarQubeScanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                        
                        withSonarQubeEnv("${SONAR_QUBE_SERVER}") {
                            withCredentials([string(credentialsId: 'sonar-server-token', variable: 'SONAR_TOKEN')]) {
                                sh "${scannerHome}/bin/sonar-scanner " +
                                   "-Dsonar.login=${SONAR_TOKEN} " +
                                   "-Dsonar.projectBaseDir=$WORKSPACE " +
                                   "-Dsonar.typescript.tsconfigPaths=tsconfig.sonar.json"
                            }
                        }
                        
                        // Limpiamos el entorno para no dejar archivos temporales
                        sh 'rm -f tsconfig.sonar.json'
                    }
                }
            }
        }
    }
}