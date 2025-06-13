pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-registry.com'
        DOCKER_CREDENTIALS = credentials('docker-registry-credentials')
        KUBECONFIG = credentials('kubeconfig')
        SONAR_TOKEN = credentials('sonar-token')
        NODE_VERSION = '18'
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 1, unit: 'HOURS')
        timestamps()
    }
    
    stages {
        stage('Checkout & Setup') {
            steps {
                echo '🚀 Starting AFRI-PLATES CI/CD Pipeline'
                checkout scm
                
                script {
                    env.BUILD_VERSION = sh(
                        script: "echo '1.0.${BUILD_NUMBER}'",
                        returnStdout: true
                    ).trim()
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                }
                
                echo "Building version: ${env.BUILD_VERSION}"
                echo "Git commit: ${env.GIT_COMMIT_SHORT}"
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('API Gateway') {
                    steps {
                        dir('backend/api-gateway') {
                            sh '''
                                echo "📦 Installing API Gateway dependencies..."
                                npm ci --prefer-offline --no-audit
                                npm run build
                            '''
                        }
                    }
                }
                stage('User Service') {
                    steps {
                        dir('backend/user-service') {
                            sh '''
                                echo "📦 Installing User Service dependencies..."
                                npm ci --prefer-offline --no-audit
                            '''
                        }
                    }
                }
                stage('Recipe Service') {
                    steps {
                        dir('backend/recipe-service') {
                            sh '''
                                echo "📦 Installing Recipe Service dependencies..."
                                npm ci --prefer-offline --no-audit
                            '''
                        }
                    }
                }
                stage('Chef Service') {
                    steps {
                        dir('backend/chef-service') {
                            sh '''
                                echo "📦 Installing Chef Service dependencies..."
                                npm ci --prefer-offline --no-audit
                            '''
                        }
                    }
                }
                stage('Frontend - Chef Dashboard') {
                    steps {
                        dir('clients/chef-dashboard') {
                            sh '''
                                echo "📦 Installing Chef Dashboard dependencies..."
                                npm ci --prefer-offline --no-audit
                                npm run build
                            '''
                        }
                    }
                }
                stage('Frontend - Admin Panel') {
                    steps {
                        dir('clients/admin-users') {
                            sh '''
                                echo "📦 Installing Admin Panel dependencies..."
                                npm ci --prefer-offline --no-audit
                                npm run build
                            '''
                        }
                    }
                }
            }
        }
        
        stage('Code Quality & Security') {
            parallel {
                stage('Lint & Format') {
                    steps {
                        script {
                            def services = ['api-gateway', 'user-service', 'recipe-service', 'chef-service']
                            services.each { service ->
                                dir("backend/${service}") {
                                    sh '''
                                        echo "🔍 Running linting for ''' + service + '''..."
                                        npm run lint || true
                                    '''
                                }
                            }
                        }
                    }
                }
                stage('Security Audit') {
                    steps {
                        script {
                            def services = ['api-gateway', 'user-service', 'recipe-service', 'chef-service']
                            services.each { service ->
                                dir("backend/${service}") {
                                    sh '''
                                        echo "🔒 Running security audit for ''' + service + '''..."
                                        npm audit --audit-level=high || true
                                    '''
                                }
                            }
                        }
                    }
                }
                stage('SonarQube Analysis') {
                    steps {
                        script {
                            withSonarQubeEnv('SonarQube') {
                                sh '''
                                    echo "📊 Running SonarQube analysis..."
                                    sonar-scanner \
                                        -Dsonar.projectKey=afri-plates \
                                        -Dsonar.projectName="AFRI-PLATES" \
                                        -Dsonar.projectVersion=${BUILD_VERSION} \
                                        -Dsonar.sources=backend,clients \
                                        -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/** \
                                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                                '''
                            }
                        }
                    }
                }
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        script {
                            def services = ['api-gateway', 'user-service', 'recipe-service', 'chef-service']
                            services.each { service ->
                                dir("backend/${service}") {
                                    sh '''
                                        echo "🧪 Running unit tests for ''' + service + '''..."
                                        npm run test:unit -- --coverage --ci --watchAll=false --testResultsProcessor=jest-junit
                                    '''
                                }
                            }
                        }
                        
                        // Publish test results
                        publishTestResults testResultsPattern: '**/test-results.xml'
                        
                        // Publish coverage reports
                        publishHTML([
                            allowMissing: false,
                            alwaysLinkToLastBuild: true,
                            keepAll: true,
                            reportDir: 'coverage',
                            reportFiles: 'index.html',
                            reportName: 'Coverage Report'
                        ])
                    }
                }
                
                stage('Integration Tests') {
                    steps {
                        sh '''
                            echo "🔗 Running integration tests..."
                            # Start test database
                            docker run -d --name test-mongo -p 27018:27017 mongo:7.0
                            
                            # Wait for database to be ready
                            sleep 10
                            
                            # Run integration tests
                            export MONGODB_URI="mongodb://localhost:27018/afri_plates_test"
                            npm run test:integration
                            
                            # Cleanup
                            docker stop test-mongo
                            docker rm test-mongo
                        '''
                    }
                }
                
                stage('API Tests') {
                    steps {
                        sh '''
                            echo "🌐 Running API tests with Newman..."
                            # Install Newman if not available
                            npm install -g newman
                            
                            # Run Postman collection tests
                            newman run tests/postman/AFRI-PLATES-API.postman_collection.json \
                                --environment tests/postman/test-environment.json \
                                --reporters cli,junit \
                                --reporter-junit-export test-results/newman-results.xml
                        '''
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    changeRequest()
                }
            }
            steps {
                script {
                    def services = [
                        'api-gateway',
                        'user-service', 
                        'recipe-service',
                        'chef-service',
                        'review-service',
                        'media-service'
                    ]
                    
                    def frontendApps = [
                        'chef-dashboard',
                        'admin-users'
                    ]
                    
                    echo "🐳 Building Docker images..."
                    
                    // Build backend services
                    services.each { service ->
                        dir("backend/${service}") {
                            script {
                                def image = docker.build(
                                    "${DOCKER_REGISTRY}/afri-plates-${service}:${BUILD_VERSION}",
                                    "--build-arg BUILD_VERSION=${BUILD_VERSION} ."
                                )
                                
                                // Tag with latest for main branch
                                if (env.BRANCH_NAME == 'main') {
                                    image.tag("${DOCKER_REGISTRY}/afri-plates-${service}:latest")
                                }
                                
                                // Push images
                                docker.withRegistry("https://${DOCKER_REGISTRY}", DOCKER_CREDENTIALS) {
                                    image.push("${BUILD_VERSION}")
                                    if (env.BRANCH_NAME == 'main') {
                                        image.push("latest")
                                    }
                                }
                            }
                        }
                    }
                    
                    // Build frontend applications
                    frontendApps.each { app ->
                        dir("clients/${app}") {
                            script {
                                def image = docker.build(
                                    "${DOCKER_REGISTRY}/afri-plates-${app}:${BUILD_VERSION}",
                                    "--build-arg BUILD_VERSION=${BUILD_VERSION} ."
                                )
                                
                                if (env.BRANCH_NAME == 'main') {
                                    image.tag("${DOCKER_REGISTRY}/afri-plates-${app}:latest")
                                }
                                
                                docker.withRegistry("https://${DOCKER_REGISTRY}", DOCKER_CREDENTIALS) {
                                    image.push("${BUILD_VERSION}")
                                    if (env.BRANCH_NAME == 'main') {
                                        image.push("latest")
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    echo "🚀 Deploying to Staging Environment..."
                    
                    withKubeConfig([credentialsId: 'kubeconfig']) {
                        sh '''
                            # Update Helm values for staging
                            helm upgrade --install afri-plates-staging ./helm-chart \
                                --namespace staging \
                                --create-namespace \
                                --set image.tag=${BUILD_VERSION} \
                                --set environment=staging \
                                --set ingress.host=staging.afri-plates.com \
                                --wait --timeout=10m
                        '''
                    }
                }
            }
        }
        
        stage('Run E2E Tests') {
            when {
                anyOf {
                    branch 'develop'
                    branch 'main'
                }
            }
            steps {
                script {
                    echo "🎭 Running End-to-End Tests..."
                    
                    sh '''
                        # Install Cypress
                        npm install -g cypress
                        
                        # Run E2E tests against staging
                        export CYPRESS_BASE_URL=https://staging.afri-plates.com
                        cypress run --record --key ${CYPRESS_RECORD_KEY} \
                            --spec "cypress/integration/**/*.spec.js" \
                            --reporter junit \
                            --reporter-options "mochaFile=test-results/e2e-results.xml"
                    '''
                    
                    // Publish E2E test results
                    publishTestResults testResultsPattern: 'test-results/e2e-results.xml'
                }
            }
        }
        
        stage('Security Scanning') {
            parallel {
                stage('Container Security') {
                    steps {
                        script {
                            echo "🔒 Running container security scans..."
                            
                            def services = ['api-gateway', 'user-service', 'recipe-service']
                            services.each { service ->
                                sh """
                                    # Scan Docker image for vulnerabilities
                                    trivy image --exit-code 0 --severity HIGH,CRITICAL \
                                        --format json --output ${service}-security-report.json \
                                        ${DOCKER_REGISTRY}/afri-plates-${service}:${BUILD_VERSION}
                                """
                            }
                        }
                    }
                }
                
                stage('OWASP ZAP Scan') {
                    steps {
                        sh '''
                            echo "🕷️ Running OWASP ZAP security scan..."
                            docker run -t owasp/zap2docker-stable zap-baseline.py \
                                -t https://staging.afri-plates.com \
                                -J zap-report.json || true
                        '''
                    }
                }
            }
        }
        
        stage('Performance Testing') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    echo "⚡ Running performance tests..."
                    
                    sh '''
                        # Install k6 for load testing
                        curl -s https://github.com/grafana/k6/releases/download/v0.45.0/k6-v0.45.0-linux-amd64.tar.gz | tar xvz
                        
                        # Run load tests
                        ./k6-v0.45.0-linux-amd64/k6 run tests/performance/load-test.js \
                            --out json=performance-results.json
                    '''
                    
                    // Archive performance results
                    archiveArtifacts artifacts: 'performance-results.json', fingerprint: true
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                allOf {
                    branch 'main'
                    not { changeRequest() }
                }
            }
            steps {
                script {
                    // Manual approval for production deployment
                    timeout(time: 5, unit: 'MINUTES') {
                        input message: 'Deploy to Production?', 
                              ok: 'Deploy',
                              submitterParameter: 'DEPLOYER'
                    }
                    
                    echo "🚀 Deploying to Production Environment..."
                    echo "Deployed by: ${env.DEPLOYER}"
                    
                    withKubeConfig([credentialsId: 'kubeconfig']) {
                        sh '''
                            # Blue-Green deployment strategy
                            helm upgrade --install afri-plates-prod ./helm-chart \
                                --namespace production \
                                --create-namespace \
                                --set image.tag=${BUILD_VERSION} \
                                --set environment=production \
                                --set ingress.host=afri-plates.com \
                                --set replicaCount=5 \
                                --set resources.requests.cpu=200m \
                                --set resources.requests.memory=256Mi \
                                --set resources.limits.cpu=500m \
                                --set resources.limits.memory=512Mi \
                                --wait --timeout=15m
                        '''
                    }
                }
            }
        }
        
        stage('Post-Deployment Verification') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    def environment = env.BRANCH_NAME == 'main' ? 'production' : 'staging'
                    def baseUrl = env.BRANCH_NAME == 'main' ? 'https://afri-plates.com' : 'https://staging.afri-plates.com'
                    
                    echo "✅ Running post-deployment verification for ${environment}..."
                    
                    sh """
                        # Health check verification
                        curl -f ${baseUrl}/health || exit 1
                        
                        # API endpoint verification
                        curl -f ${baseUrl}/api/v1/status || exit 1
                        
                        # Database connectivity check
                        curl -f ${baseUrl}/api/v1/recipes?limit=1 || exit 1
                    """
                    
                    // Send deployment notification
                    sh """
                        curl -X POST -H 'Content-type: application/json' \
                            --data '{"text":"🚀 AFRI-PLATES ${BUILD_VERSION} deployed to ${environment} successfully!"}' \
                            ${SLACK_WEBHOOK_URL}
                    """
                }
            }
        }
    }
    
    post {
        always {
            echo "🧹 Cleaning up workspace..."
            
            // Archive important artifacts
            archiveArtifacts artifacts: '''
                test-results/**/*.xml,
                coverage/**/*,
                *-security-report.json,
                performance-results.json
            ''', fingerprint: true, allowEmptyArchive: true
            
            // Clean up Docker images to save space
            sh '''
                docker image prune -f
                docker container prune -f
            '''
        }
        
        success {
            echo "✅ Pipeline completed successfully!"
            
            // Send success notification
            emailext (
                subject: "✅ Build Success: AFRI-PLATES ${BUILD_VERSION}",
                body: """
                    Build ${BUILD_NUMBER} completed successfully!
                    
                    Version: ${BUILD_VERSION}
                    Branch: ${BRANCH_NAME}
                    Commit: ${GIT_COMMIT_SHORT}
                    
                    View build: ${BUILD_URL}
                    View coverage: ${BUILD_URL}Coverage_Report/
                """,
                to: "${env.CHANGE_AUTHOR_EMAIL ?: 'team@afri-plates.com'}"
            )
        }
        
        failure {
            echo "❌ Pipeline failed!"
            
            // Send failure notification
            emailext (
                subject: "❌ Build Failed: AFRI-PLATES ${BUILD_VERSION}",
                body: """
                    Build ${BUILD_NUMBER} failed!
                    
                    Branch: ${BRANCH_NAME}
                    Commit: ${GIT_COMMIT_SHORT}
                    
                    Check console output: ${BUILD_URL}console
                    
                    Failed stage: ${env.STAGE_NAME}
                """,
                to: "${env.CHANGE_AUTHOR_EMAIL ?: 'team@afri-plates.com'}"
            )
        }
        
        unstable {
            echo "⚠️ Pipeline completed with warnings!"
        }
    }
} 