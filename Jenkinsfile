pipeline {
    agent any

    environment {
        SONAR_QUBE_SERVER = 'SonarQubeServer'
    }

    stages {
        stage('Pipeline Completo Frontend') {
            steps {
                // Envolvemos todo el pipeline dentro del wrapper de Node v20/v22 estable
                script {
                    nodejs(nodeJSInstallationName: 'NodeJS') { 
                        
                        echo '🚀 Iniciando Fase 1: Instalación Limpia...'
                        sh 'npm ci'
                        
                        echo '🚀 Iniciando Fase 2: Ejecución de la Suite de Pruebas...'
                        // Vitest correrá nativamente y escribirá la cobertura en coverage/lcov.info
                        sh 'npm run test -- --coverage || true'
                        
                        echo '🚀 Iniciando Fase 3: Análisis Estático en SonarQube...'
                        def scannerHome = tool name: 'SonarQubeScanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                        
                        withSonarQubeEnv("${SONAR_QUBE_SERVER}") {
                            withCredentials([string(credentialsId: 'sonar-server-token', variable: 'SONAR_TOKEN')]) {
                                sh "${scannerHome}/bin/sonar-scanner -Dsonar.login=${SONAR_TOKEN} -Dsonar.projectBaseDir=$WORKSPACE"
                            }
                        }
                    }
                }
            }
        }
    }
}