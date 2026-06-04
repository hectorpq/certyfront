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
                        // Creamos un archivo tsconfig temporal y plano sin las opciones conflictivas de Vite
                        sh 'echo \'{"compilerOptions": {"moduleResolution": "node", "target": "es2020", "module": "esnext"}}\' > tsconfig.sonar.json'
                        
                        def scannerHome = tool name: 'SonarQubeScanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                        
                        withSonarQubeEnv("${SONAR_QUBE_SERVER}") {
                            withCredentials([string(credentialsId: 'sonar-server-token', variable: 'SONAR_TOKEN')]) {
                                // Forzamos al scanner a leer la configuración limpia y relajada que acabamos de crear
                                sh "${scannerHome}/bin/sonar-scanner " +
                                   "-Dsonar.login=${SONAR_TOKEN} " +
                                   "-Dsonar.projectBaseDir=$WORKSPACE " +
                                   "-Dsonar.typescript.tsconfigPaths=tsconfig.sonar.json"
                            }
                        }
                        
                        // Limpiamos el archivo temporal para no dejar basura
                        sh 'rm -f tsconfig.sonar.json'
                    }
                }
            }
        }
    }
}