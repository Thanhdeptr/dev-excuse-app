// Jenkinsfile (Declarative Pipeline)

pipeline {
    agent any // Chạy trên bất kỳ agent nào có sẵn

    environment {
        // ----- BẠN CẦN THAY ĐỔI CÁC GIÁ TRỊ NÀY -----
        
        // 1. Tên Docker Hub username của bạn
        DOCKERHUB_USERNAME = "your-dockerhub-username"
        
        // 2. Tên image trên Docker Hub (ví dụ: tenban/dev-excuse)
        DOCKER_IMAGE_NAME = "${DOCKERHUB_USERNAME}/dev-excuse-app"
        
        // 3. Tên của Credentials trong Jenkins (sẽ tạo ở Bước 3)
        DOCKER_CREDENTIALS_ID = "dockerhub-credentials" // Dùng để login Docker Hub
        SSH_CREDENTIALS_ID    = "prod-server-ssh"     // Dùng để login server Production

        // 4. Thông tin server Production (nơi bạn deploy)
        PROD_SERVER_IP   = "123.45.67.89" // IP của server
        PROD_SERVER_USER = "ubuntu"      // User (ví dụ: ubuntu, ec2-user, root)
        
        // ----- CÁC BIẾN TỰ ĐỘNG -----
        
        // Tên image với tag là số lần build (ví dụ: tenban/dev-excuse:5)
        DOCKER_IMAGE_TAGGED = "${DOCKER_IMAGE_NAME}:${env.BUILD_NUMBER}"
    }

    stages {
        
        // ============== GIAI ĐOẠN CI ==============

        stage('1. Checkout Code') {
            steps {
                echo "Lấy code từ GitHub..."
                checkout scm
            }
        }

        stage('2. Build & Install') {
            steps {
                echo "Cài đặt thư viện (npm install)..."
                // Dùng container node:18-slim để chạy npm install
                // Điều này giúp máy agent không cần cài Node.js
                docker.image('node:18-slim').inside {
                    sh "npm install"
                }
            }
        }

        stage('3. Run Unit Tests') {
            steps {
                echo "Chạy Unit Tests (npm test)..."
                docker.image('node:18-slim').inside {
                    // Nếu 'npm test' thất bại, pipeline sẽ dừng ở đây
                    sh "npm test"
                }
            }
        }

        // ============== GIAI ĐOẠN CD ==============

        stage('4. Build Docker Image') {
            // Giai đoạn này chỉ chạy nếu 3 bước trên thành công
            steps {
                echo "Building Docker image: ${DOCKER_IMAGE_TAGGED}"
                // Dùng Dockerfile ở thư mục hiện tại (.)
                sh "docker build -t ${DOCKER_IMAGE_TAGGED} ."
            }
        }

        stage('5. Push to Docker Hub') {
            steps {
                echo "Đẩy image lên Docker Hub..."
                // Dùng credentials ID đã định nghĩa ở environment
                withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh "docker login -u ${USER} -p ${PASS}"
                    sh "docker push ${DOCKER_IMAGE_TAGGED}"
                    
                    // Đẩy thêm tag 'latest' để dễ quản lý
                    sh "docker tag ${DOCKER_IMAGE_TAGGED} ${DOCKER_IMAGE_NAME}:latest"
                    sh "docker push ${DOCKER_IMAGE_NAME}:latest"
                }
            }
        }

        stage('6. Deploy to Production') {
            steps {
                echo "Triển khai lên server Production..."
                // Dùng plugin SSH Agent để đăng nhập an toàn
                sshagent([SSH_CREDENTIALS_ID]) {
                    // Chạy một chuỗi lệnh trên server
                    sh """
                        ssh -o StrictHostKeyChecking=no ${PROD_SERVER_USER}@${PROD_SERVER_IP} '
                            echo 'Đã kết nối tới server!'
                            
                            # Kéo image mới nhất về (bản có tag :latest)
                            docker pull ${DOCKER_IMAGE_NAME}:latest
                            
                            # Dừng và xóa container cũ (nếu có)
                            # '|| true' để lệnh không báo lỗi nếu container 'dev-excuse' chưa tồn tại
                            docker stop dev-excuse || true
                            docker rm dev-excuse || true
                            
                            # Chạy container mới
                            # -d: chạy ngầm
                            # --name: đặt tên container
                            # -p 80:3000: map port 80 của server vào port 3000 của container
                            # (để bạn có thể truy cập bằng http://<IP_Server>)
                            echo 'Chạy container mới...'
                            docker run -d --name dev-excuse -p 80:3000 ${DOCKER_IMAGE_NAME}:latest
                            
                            echo 'Triển khai thành công!'
                        '
                    """
                }
            }
        }
    }
    
    // Luôn chạy các bước này sau khi pipeline kết thúc (dù thành công hay thất bại)
    post {
        always {
            echo "Dọn dẹp workspace và Docker..."
            // Xóa image vừa build trên máy agent để tiết kiệm dung lượng
            sh "docker rmi ${DOCKER_IMAGE_TAGGED} || true" 
            sh "docker rmi ${DOCKER_IMAGE_NAME}:latest || true"
            sh "docker logout"
            
            // Xóa workspace của Jenkins
            cleanWs() 
        }
    }
}