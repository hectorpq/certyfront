pipeline {
    agent any
    environment {
        SONAR_QUBE_SERVER = 'SonarQubeServer'
    }
    stages {
        stage('Pipeline Frontend') {
            steps {
                script {
                    echo 'Fase 1: Instalando dependencias...'
                    powershell 'npm ci'

                    echo 'Fase 2: Ejecutando suite de pruebas y cobertura...'
                    powershell 'npm run test'

                    echo 'Fase 3: Verificando reporte de cobertura...'
                    powershell 'Get-ChildItem coverage/ | Select-Object -First 20'

                    echo 'Fase 4: Analisis Estatico SonarQube...'

                    def scannerHome = tool name: 'SonarQubeScanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'

                    withSonarQubeEnv("${SONAR_QUBE_SERVER}") {
                        withCredentials([string(credentialsId: 'sonar-server-token', variable: 'SONAR_TOKEN')]) {
                            powershell "& '${scannerHome}\\bin\\sonar-scanner' " +
                                "-Dsonar.login=${SONAR_TOKEN} " +
                                "-Dsonar.projectBaseDir=$WORKSPACE " +
                                "-Dsonar.typescript.tsconfigPaths=tsconfig.sonar.json " +
                                "-Dsonar.javascript.lcov.reportPaths=coverage/lcov.info " +
                                "-Dsonar.sourceEncoding=UTF-8"
                        }
                    }
                }
            }
        }
    }
}
