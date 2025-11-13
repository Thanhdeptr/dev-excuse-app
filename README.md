# 🚀 Developer Excuse App - CI/CD Pipeline Demo

A complete CI/CD pipeline demo using Jenkins and Docker. Automatically tests, builds, and deploys a Node.js API that returns random developer excuses.

## 📱 Application Overview

**Developer Excuse App** is a simple Node.js/Express.js web application that returns random developer excuses via a single endpoint.

### Features

- **Endpoint:** `GET /`
- **Function:** Returns a random excuse from a predefined list
- **Example excuses:**
  - "It works on my machine."
  - "That's weird, I've never seen that before."
  - "It must be a caching issue."
  - "It's not a bug, it's an undocumented feature."


## 🏗️ CI/CD Architecture (Docker-out-of-Docker)

The pipeline uses a **Docker-out-of-Docker (DooD)** architecture with 3 components:

1. **Jenkins Master** (`jenkinsci/blueocean`) - Orchestrates the pipeline
2. **Socat** (`alpine/socat`) - TCP proxy for Docker socket forwarding
3. **Dynamic Jenkins Agent** (`hatanthanh/my-jenkins-agent`) - Custom agent image with Node.js, Docker CLI, and SSH client

**Key Configuration:**
- Agent runs as `USER node` (UID 1000) to match Jenkins Master
- Uses `--group-add 984` to grant Docker socket access (GID must match host's docker group)

---

## 🌊 Pipeline Flow

1. Developer pushes code to `main` branch
2. GitHub webhook triggers Jenkins (via ngrok)
3. Jenkins Master starts a dynamic agent container
4. Agent executes pipeline stages:
   - **Checkout** code from GitHub
   - **Test** with `npm test`
   - **Build & Push** Docker image to Docker Hub
   - **Deploy** to production server via SSH
5. Agent container is removed after completion

---

## 🔧 Pipeline Stages

### Stage 1: Checkout Code
```groovy
checkout scm
```

### Stage 2: Linting & Unit Test
```groovy
sh "npm install"
sh "npm run test"
```

### Stage 3: Containerize (Build & Push)
- Docker login with credentials
- Build image: `docker build -t ${DOCKER_IMAGE_TAGGED} .`
- Tag and push to Docker Hub

### Stage 4: Deploy to Production
- SSH into production server
- Pull latest image
- Stop old container and start new one

### Agent Configuration

```groovy
agent {
    docker(
        image: 'hatanthanh/my-jenkins-agent:latest',
        alwaysPull: true,
        entrypoint: '',
        args: '--network jenkins --group-add 984 -v /var/run/docker.sock:/var/run/docker.sock'
    )
}
```

---

## 🛠️ Tech Stack

- **CI/CD:** Jenkins (Blue Ocean), Docker, Docker Hub
- **App:** Node.js, Express.js, Mocha, Supertest
- **Infrastructure:** Socat, OpenSSH, ngrok

---

## ⚙️ Configuration

### Required Jenkins Credentials

- `dockerhub-credentials` - Docker Hub username/password
- `ssh-key` - SSH private key for production server

### Environment Variables (Jenkinsfile)

```groovy
DOCKERHUB_USERNAME = "hatanthanh"
APP_IMAGE_NAME     = "dev-excuse-app"
DOCKER_CREDS       = "dockerhub-credentials"
PROD_SERVER_CREDS  = "ssh-key"
PROD_SERVER_HOST   = "hatthanh@172.16.16.176"
CONTAINER_NAME     = "dev-excuse-prod"
```

### Docker Group GID

Check your host's docker group GID:
```bash
grep docker /etc/group
# Update --group-add 984 in Jenkinsfile if GID differs
```

---

## 📁 Project Structure

```
dev-excuse-app/
├── agent/Dockerfile.agent  # Custom Jenkins agent
├── test/test.js            # Unit tests
├── app.js                  # Main application
├── Dockerfile              # App container image
├── Jenkinsfile             # CI/CD pipeline
└── package.json            # Dependencies
```

---

## 🚀 Quick Start

1. Clone repository
2. Configure Jenkins credentials
3. Update environment variables in `Jenkinsfile`
4. Set up GitHub webhook
5. Push to `main` branch → Pipeline runs automatically

---

## 📝 Notes

- Designed for demo/learning purposes
- Ensure production server has Docker installed
- Verify Docker group GID matches `--group-add` value in Jenkinsfile

---

**License:** MIT
