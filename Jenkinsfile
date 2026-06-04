pipeline {
    agent any

    environment {
        SONAR_QUBE_SERVER = 'SonarQubeServer'
    }

    stages {
        stage('Instalación y Pruebas') {
            steps {
                // Invocamos dinámicamente el wrapper de NodeJS compatible con cualquier alias
                script {
                    nodejs(nodeJSInstallationName: 'NodeJS') { 
                        // 1. Instalación limpia de dependencias
                        sh 'npm ci'
                        
                        // 2. Ejecución de pruebas unitarias (Vitest configurado en tu package.json)
                        sh 'npm run test -- --coverage || true'
                    }
                }
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