pipeline {
    agent any

    environment {
        SONAR_QUBE_SERVER = 'SonarQubeServer'
    }

    // 🚀 SOLUCIÓN: Inyectamos Node.js automáticamente en el entorno del Pipeline
    tools {
        nodejs 'node' 
    }

    stages {
        stage('Instalación de Dependencias') {
            steps {
                // Ahora Jenkins tendrá npm mapeado en el PATH y correrá sin problemas
                sh 'npm ci'
            }
        }

        stage('Ejecución de Pruebas') {
            steps {
                // Ejecuta los tests del frontend generando la cobertura
                sh 'npm run test -- --coverage || true'
            }
        }

        stage('Static Analysis (SonarQube)') {
            steps {
                script {
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