pipeline {
    // KHỐI AGENT ĐÃ SỬA LỖI HOÀN CHỈNH
    agent {
        docker(
            // 1. Image "Thợ xây" của bạn (đã có user 'node' UID 1000)
            image: 'hatanthanh/my-jenkins-agent:latest',
            
            // 2. SỬA LỖI ENTRYPOINT (lỗi "didn't run expected command")
            //    Bằng cách vô hiệu hóa entrypoint của image 'node'
            entrypoint: '', 
            
            // 3. Luôn pull image mới nhất từ registry (đảm bảo có agent image mới nhất)
            alwaysPull: true,
            
            // 4. 'args' cho CÁC CỜ CÒN LẠI
            //    --network jenkins: Sửa lỗi "treo" (bắt buộc, để agent chung mạng master)
            //    --group-add 984: Ép container nhận quyền của group Docker Host (GID 984)
            //    -v ...: Mount Docker socket (bắt buộc, để chạy 'docker build')
            args: '--network jenkins --group-add 984 -v /var/run/docker.sock:/var/run/docker.sock'
        )
    }

    // Các biến môi trường cho pipeline
    environment {
        // --- THAY ĐỔI CÁC GIÁ TRỊ CỦA BẠN VÀO ĐÂY ---
        DOCKERHUB_USERNAME = "hatanthanh"
        APP_IMAGE_NAME     = "dev-excuse-app"         // Tên "Sản phẩm" của bạn
        DOCKER_CREDS       = "dockerhub-credentials"  // ID Credentials Docker Hub
        PROD_SERVER_CREDS  = "ssh-key"      // ID Credentials SSH
        PROD_SERVER_HOST   = "hatthanh@172.16.16.176"  // <-- THAY BẰNG IP SERVER PROD CỦA BẠN
        CONTAINER_NAME     = "dev-excuse-prod"      // Tên container chạy trên production
        // ------------------------------------------
        
        // Các biến tự động
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
                // Lệnh 'npm' đã có sẵn trong agent 'hatanthanh/my-jenkins-agent'
                sh "npm install"
                sh "npm run test"
            }
        }

        stage('3. Containerize (Build & Push)') {
            steps {
                echo "Building and pushing ${DOCKER_IMAGE_TAGGED}..."
                // Debug: Kiểm tra xem user hiện tại có thuộc group 984 chưa
                sh "id"
                
                withCredentials([usernamePassword(credentialsId: DOCKER_CREDS, usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh "docker login -u ${USER} -p ${PASS}"
                    // Build image ứng dụng (dùng file 'Dockerfile' trong repo)
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
                // Lệnh 'ssh' đã có sẵn trong agent
                sshagent(credentials: [PROD_SERVER_CREDS]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${PROD_SERVER_HOST} '
                            echo 'Connected! Pulling new image...'
                            docker pull ${DOCKER_IMAGE_LATEST}
                            
                            echo 'Stopping and removing old container...'
                            docker stop ${CONTAINER_NAME} || true
                            docker rm ${CONTAINER_NAME} || true
                            
                            echo 'Starting new container...'
                            docker run -d --name ${CONTAINER_NAME} -p 80:3000 ${DOCKER_IMAGE_LATEST}
                            
                            echo "Deploy successful!"
                        '
                    """
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline finished."
            cleanWs() // Dọn dẹp workspace
        }
    }
}