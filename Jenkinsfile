pipeline {
    agent any
    environment {
        SONAR_QUBE_SERVER = 'SonarQubeServer'
    }
    stages {
        stage('Pipeline Frontend') {
            steps {
                script {
                    nodejs(nodeJSInstallationName: 'NodeJS') { 
                        echo '🚀 Fase 1: Instalando dependencias...'
                        sh 'npm ci'
                        
                        echo '🚀 Fase 2: Ejecutando suite de pruebas y cobertura...'
                        // Solo ejecutamos el test aquí una vez
                        sh 'npm run test -- --coverage'
                        
                        echo '🚀 Fase 3: Análisis Estático SonarQube...'
                        // Crear config temporal para SonarQube
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
                        sh 'rm -f tsconfig.sonar.json'
                    }
                }
            }
        }
    }
}