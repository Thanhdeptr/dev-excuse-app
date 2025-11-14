# Developer Excuse App - Jenkins CI/CD Pipeline

A complete CI/CD pipeline demo using Jenkins and Docker. Automatically tests, builds, and deploys a Node.js API that returns random developer excuses.

## Application Overview

**Developer Excuse App** is a simple Node.js/Express.js web application that returns random developer excuses via a single endpoint.

### Features

- **Endpoint:** `GET /`
- **Function:** Returns a random excuse from a predefined list
- **Example excuses:**
  - "It works on my machine."
  - "That's weird, I've never seen that before."
  - "It must be a caching issue."
  - "It's not a bug, it's an undocumented feature."


## CI/CD Architecture (Docker-out-of-Docker)

The pipeline uses a **Docker-out-of-Docker (DooD)** architecture with 3 components:

1. **Jenkins Master** (`jenkinsci/blueocean`) - Orchestrates the pipeline
2. **Socat** (`alpine/socat`) - TCP proxy for Docker socket forwarding
3. **Dynamic Jenkins Agent** (`hatanthanh/my-jenkins-agent`) - Custom agent image with Node.js, Docker CLI, and SSH client

**Key Configuration:**
- Agent runs as `USER node` (UID 1000) to match Jenkins Master
- Uses `--group-add 984` to grant Docker socket access (GID must match host's docker group)

---

## Jenkins Setup & Configuration

This project uses **Jenkins Blue Ocean** with a **Docker-out-of-Docker (DooD)** architecture.

### Jenkins Infrastructure

- **Jenkins Master:** Runs in Docker container (`jenkinsci/blueocean`), accessible at `http://localhost:8080`
- **Socat:** TCP proxy container that forwards Docker socket communication (`tcp://socat:2375`)
- **Dynamic Agent:** Custom agent image (`hatanthanh/my-jenkins-agent`) spawned on-demand for each pipeline run

### Jenkins Configuration

**Required Plugins:**
- Blue Ocean (modern UI)
- Docker Pipeline
- GitHub (webhook integration)
- SSH Agent
- Credentials Binding

**Docker Integration:**
- Jenkins communicates with Docker daemon via Socat TCP proxy
- Docker Cloud configured with URI: `tcp://socat:2375`
- Both Jenkins and Socat run on shared `jenkins` network

**Pipeline Job:**
- Type: Pipeline (from SCM)
- Source: GitHub repository
- Script: `Jenkinsfile` in repository root
- Trigger: GitHub webhook (via ngrok for local development)

### Jenkinsfile Structure

The pipeline uses **Declarative Pipeline** syntax with 4 main stages:
1. Checkout code from GitHub
2. Run unit tests
3. Build and push Docker image
4. Deploy to production server

---

## Pipeline Flow

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

## Pipeline Stages

### Stage 1: Checkout Code
Retrieves source code from GitHub repository using `checkout scm`.

### Stage 2: Linting & Unit Test
- Installs dependencies: `npm install`
- Runs unit tests: `npm run test` (using Mocha and Supertest)
- Validates API endpoint returns correct format

### Stage 3: Containerize (Build & Push)
- Authenticates with Docker Hub using stored credentials
- Builds application image using `Dockerfile`
- Tags image with build number and `latest`
- Pushes both tags to Docker Hub registry

### Stage 4: Deploy to Production
- Connects to production server via SSH
- Pulls latest image from Docker Hub
- Stops and removes old container
- Starts new container with updated image on port 80

### Agent Configuration

The pipeline runs in a dynamic Docker agent container with the following configuration:

```groovy
agent {
    docker(
        image: 'hatanthanh/my-jenkins-agent:latest',
        alwaysPull: true,  // Always pull latest agent image
        entrypoint: '',     // Disable default entrypoint
        args: '--network jenkins --group-add 984 -v /var/run/docker.sock:/var/run/docker.sock'
    )
}
```

**Key Agent Settings:**
- `--network jenkins`: Connects agent to Jenkins network for communication
- `--group-add 984`: Grants Docker socket access (GID must match host's docker group)
- `-v /var/run/docker.sock`: Mounts Docker socket for building images

---

## Tech Stack

- **CI/CD:** Jenkins (Blue Ocean), Docker, Docker Hub
- **App:** Node.js, Express.js, Mocha, Supertest
- **Infrastructure:** Socat, OpenSSH, ngrok

---

## Configuration

### Required Jenkins Credentials

The pipeline requires two credentials stored in Jenkins:

1. **`dockerhub-credentials`** (ID must match exactly)
   - Type: Username with password
   - Used for: Docker Hub authentication in Stage 3

2. **`ssh-key`** (ID must match exactly)
   - Type: SSH Username with private key
   - Used for: Production server deployment in Stage 4

### Environment Variables

These variables must be configured in the `Jenkinsfile` environment section:

```groovy
DOCKERHUB_USERNAME = "hatanthanh"              // Your Docker Hub username
APP_IMAGE_NAME     = "dev-excuse-app"          // Application image name
DOCKER_CREDS       = "dockerhub-credentials"   // Credential ID (must match Jenkins)
PROD_SERVER_CREDS  = "ssh-key"                 // Credential ID (must match Jenkins)
PROD_SERVER_HOST   = "hatthanh@172.16.16.176"  // Production server SSH connection
CONTAINER_NAME     = "dev-excuse-prod"         // Container name on production
```

**Important Configuration Notes:**
- `DOCKER_CREDS` and `PROD_SERVER_CREDS` must exactly match the credential IDs in Jenkins
- `PROD_SERVER_HOST` format: `username@hostname_or_ip`
- Docker group GID (`--group-add 984`) must match your host's docker group GID
  - Check with: `grep docker /etc/group`
  - Update Jenkinsfile if GID differs

---

## Project Structure

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

## Deployment Process

When code is pushed to the `main` branch:

1. GitHub webhook triggers Jenkins pipeline (via ngrok tunnel)
2. Jenkins spawns dynamic agent container
3. Pipeline executes all 4 stages sequentially
4. On success, application is automatically deployed to production
5. Agent container is cleaned up after completion

Pipeline status and logs can be monitored in Jenkins Blue Ocean UI at `http://localhost:8080/blue`.

---

## Important Notes

- **Docker Group GID:** The `--group-add 984` value in Jenkinsfile must match your host's docker group GID. Verify with `grep docker /etc/group` and update if different.
- **Production Server:** Must have Docker installed and SSH access configured
- **Network:** Jenkins and Socat containers must be on the same Docker network (`jenkins`)
- **Credentials:** Credential IDs in Jenkinsfile must exactly match those configured in Jenkins

---

**License:** MIT
