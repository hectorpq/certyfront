pipeline {
    agent any

    environment {
        SONAR_QUBE_SERVER = 'SonarQubeServer'
    }

    stages {
        stage('Instalación de Dependencias') {
            steps {
                // Instalación limpia de paquetes de Node de acuerdo al package-lock.json
                sh 'npm ci'
            }
        }

        stage('Ejecución de Pruebas') {
            steps {
                // Ejecuta los tests del frontend generando el reporte lcov para SonarQube
                // Nota: Asegúrate de tener configurado tu script de test para generar cobertura
                sh 'npm run test -- --coverage || true'
            }
        }

        stage('Static Analysis (SonarQube)') {
            steps {
                script {
                    // Invoca la herramienta global de escaneo que configuramos en Jenkins
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