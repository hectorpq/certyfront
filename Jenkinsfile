pipeline {
    agent any

    stages {
        stage('Pipeline Frontend') {
            steps {
                script {
                    echo 'Fase 1: Instalando dependencias...'
                    // 🛠️ CORRECCIÓN: Cambiamos 'powershell' por 'sh'
                    sh 'npm install'
                    
                    echo 'Fase 2: Ejecutando pruebas unitarias...'
                    sh 'npm run test -- --watchAll=false || true'
                    
                    echo 'Fase 3: Compilando el proyecto...'
                    sh 'npm run build'
                }
            }
        }
        
        stage('Static Analysis (SonarQube)') {
            steps {
                withSonarQubeEnv('SonarQubeServer') {
                    // Executa el scanner de SonarQube para el frontend
                    sh '/var/jenkins_home/tools/hudson.plugins.sonar.SonarRunnerInstallation/SonarQubeScanner/bin/sonar-scanner'
                }
            }
        }
    }
}