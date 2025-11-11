pipeline {
    agent {
        docker {
            image 'hatanthanh/my-jenkins-agent:latest'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
            args '-v /var/run/docker.sock:/var/run/docker.sock -u root'
        }
    }

    environment {
        DOCKERHUB_USERNAME = "hatanthanh"
        APP_IMAGE_NAME     = "dev-excuse-app" // Hoặc tên bạn muốn
        DOCKER_CREDS       = "5ec413a4-84e5-4ca6-bbf4-9a1800bee624"
        PROD_SERVER_CREDS  = "807ad1b3-3859-423d-9c60-57d49e0153bf"
        PROD_SERVER_HOST   = "hatthanh@192.168.1.4" 
        CONTAINER_NAME     = "dev-excuse-prod"
        
        DOCKER_IMAGE_TAGGED = "${DOCKERHUB_USERNAME}/${APP_IMAGE_NAME}:${env.BUILD_NUMBER}"
        DOCKER_IMAGE_LATEST = "${DOCKERHUB_USERNAME}/${APP_IMAGE_NAME}:latest"
    }

    stages {
        
        stage('1. Checkout Code') {
            steps {
                echo "Checking out code..."
                checkout scm
            }
        }

        stage('2. Linting & Unit Test') {
            steps {
                echo "Running tests..."
                sh "npm install"
                sh "npm run test"
            }
        }

        stage('3. Containerize (Build & Push)') {
            steps {
                echo "Building and pushing ${DOCKER_IMAGE_TAGGED}..."
                withCredentials([usernamePassword(credentialsId: DOCKER_CREDS, usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh "docker login -u ${USER} -p ${PASS}"
                    
                    // Build image ứng dụng (dùng file 'Dockerfile')
                    sh "docker build -t ${DOCKER_IMAGE_TAGGED} ." 
                    
                    sh "docker tag ${DOCKER_IMAGE_TAGGED} ${DOCKER_IMAGE_LATEST}"
                    sh "docker push ${DOCKER_IMAGE_TAGGED}"
                    sh "docker push ${DOCKER_IMAGE_LATEST}"
                    sh "docker logout"
                }
            }
        }

        stage('4. Deploy to Production') {
            steps {
                echo "Deploying to production..."
                sshagent(credentials: [PROD_SERVER_CREDS]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${PROD_SERVER_HOST} '
                            docker pull ${DOCKER_IMAGE_LATEST}
                            docker stop ${CONTAINER_NAME} || true
                            docker rm ${CONTAINER_NAME} || true
                            docker run -d --name ${CONTAINER_NAME} -p 80:3000 ${DOCKER_IMAGE_LATEST}
                            echo "Deploy successful!"
                        '
                    """
                }
            }
        }
    }
}