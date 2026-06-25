pipeline {
    agent any

    stages {
        stage('Pipeline Frontend') {
            steps {
                script {
                    // Levantamos un contenedor temporal de Node 20 para aislar la compilación
                    docker.image('node:20-slim').inside {
                        echo 'Fase 1: Instalando dependencias...'
                        sh 'npm install'
                        
                        echo 'Fase 2: Ejecutando pruebas unitarias...'
                        sh 'npm run test -- --watchAll=false || true'
                        
                        echo 'Fase 3: Compilando el proyecto...'
                        sh 'npm run build'
                    }
                }
            }
        }
        
        stage('Static Analysis (SonarQube)') {
            steps {
                withSonarQubeEnv('SonarQubeServer') {
                    sh '/var/jenkins_home/tools/hudson.plugins.sonar.SonarRunnerInstallation/SonarQubeScanner/bin/sonar-scanner'
                }
            }
        }
    }
}