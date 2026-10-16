pipeline {
  agent { label 'windows-docker' }

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    CI_COMPOSE_FILE = 'docker-compose.ci.yml'
    CI_COMPOSE_PROJECT = "mini-store-ci-${BUILD_NUMBER}"
    CI_POSTGRES_USER = 'mini_store_ci'
    CI_POSTGRES_PASSWORD = 'ci-only-db-password'
    CI_POSTGRES_DB = 'mini_store_ci'
    CI_JWT_SECRET = 'ci-only-secret-with-at-least-32-characters-123456'
    CI_ADMIN_USERNAME = 'ci-admin'
    CI_ADMIN_EMAIL = 'ci-admin@example.test'
    CI_ADMIN_PASSWORD = 'CI-Only-Admin-Password-2026!'
    CI_ADMIN_FULL_NAME = 'CI Admin'
    CI_FRONTEND_IMAGE = "mini-store-frontend:ci-${BUILD_NUMBER}"
    CI_BACKEND_IMAGE = "mini-store-backend:ci-${BUILD_NUMBER}"
  }

  stages {
    stage('Preflight') {
      steps {
        bat 'node --version'
        bat 'npm --version'
        bat 'docker version'
        bat 'docker compose version'
        script {
          def nodeVersion = bat(returnStdout: true, script: '@node --version').trim()
          if (!(nodeVersion ==~ /v24\..*/)) {
            error("This Jenkins agent must use Node.js 24; found ${nodeVersion}")
          }
        }
      }
    }

    stage('Install backend dependencies') {
      steps {
        dir('backend') {
          bat 'npm ci'
        }
      }
    }

    stage('Install frontend dependencies') {
      steps {
        dir('frontend') {
          bat 'npm ci'
        }
      }
    }

    stage('Start isolated CI PostgreSQL') {
      steps {
        bat 'docker compose -f "%CI_COMPOSE_FILE%" -p "%CI_COMPOSE_PROJECT%" up -d'
        script {
          def containerId = bat(
            returnStdout: true,
            script: '@docker compose -f "%CI_COMPOSE_FILE%" -p "%CI_COMPOSE_PROJECT%" ps -q postgres'
          ).trim()
          if (!containerId) {
            error('Could not find the CI PostgreSQL container.')
          }

          def healthy = false
          for (int attempt = 0; attempt < 30; attempt++) {
            def status = bat(
              returnStdout: true,
              script: '@docker inspect --format="{{.State.Health.Status}}" ' + containerId
            ).trim()
            if (status == 'healthy') {
              healthy = true
              break
            }
            if (status == 'unhealthy') {
              error('The isolated CI PostgreSQL container became unhealthy.')
            }
            sleep(time: 2, unit: 'SECONDS')
          }
          if (!healthy) {
            error('Timed out waiting for isolated CI PostgreSQL to become healthy.')
          }

          def publishedPort = bat(
            returnStdout: true,
            script: '@docker compose -f "%CI_COMPOSE_FILE%" -p "%CI_COMPOSE_PROJECT%" port postgres 5432'
          ).trim()
          def portMatcher = (publishedPort =~ /127\.0\.0\.1:(\d+)/)
          if (!portMatcher.find()) {
            error("Could not determine the loopback-only CI PostgreSQL port from: ${publishedPort}")
          }
          env.CI_DATABASE_URL = "postgresql://${env.CI_POSTGRES_USER}:${env.CI_POSTGRES_PASSWORD}@127.0.0.1:${portMatcher.group(1)}/${env.CI_POSTGRES_DB}?schema=public"
        }
      }
    }

    stage('Backend checks, Prisma and API tests') {
      steps {
        dir('backend') {
          withEnv([
            "DATABASE_URL=${env.CI_DATABASE_URL}",
            'NODE_ENV=test',
            "JWT_SECRET=${env.CI_JWT_SECRET}",
            'JWT_EXPIRES_IN=2h',
            'CORS_ORIGIN=http://localhost:5173',
            "ADMIN_USERNAME=${env.CI_ADMIN_USERNAME}",
            "ADMIN_EMAIL=${env.CI_ADMIN_EMAIL}",
            "ADMIN_PASSWORD=${env.CI_ADMIN_PASSWORD}",
            "ADMIN_FULL_NAME=${env.CI_ADMIN_FULL_NAME}"
          ]) {
            bat 'npm run lint'
            bat 'npm audit --omit=dev'
            bat 'npx prisma validate'
            bat 'npm run db:generate'
            bat 'npm run db:deploy'
            bat 'npm run db:seed'
            bat 'npm test'
          }
        }
      }
    }

    stage('Frontend checks') {
      steps {
        dir('frontend') {
          bat 'npm audit'
          bat 'npm run lint'
          withEnv(['VITE_API_URL=/api']) {
            bat 'npm run build'
          }
        }
      }
    }

    stage('Build Docker images') {
      steps {
        bat 'docker build --build-arg VITE_API_URL=/api -t "%CI_FRONTEND_IMAGE%" ./frontend'
        bat 'docker build -t "%CI_BACKEND_IMAGE%" ./backend'
      }
    }

    stage('Frontend container smoke test') {
      steps {
        script {
          env.CI_FRONTEND_CONTAINER = "mini-store-ci-frontend-${env.BUILD_NUMBER}"
          bat 'docker run -d --name "%CI_FRONTEND_CONTAINER%" -p 127.0.0.1::80 "%CI_FRONTEND_IMAGE%"'

          def publishedPort = bat(
            returnStdout: true,
            script: '@docker port "%CI_FRONTEND_CONTAINER%" 80/tcp'
          ).trim()
          def portMatcher = (publishedPort =~ /127\.0\.0\.1:(\d+)/)
          if (!portMatcher.find()) {
            error("Could not determine the loopback-only frontend smoke-test port from: ${publishedPort}")
          }
          env.CI_FRONTEND_PORT = portMatcher.group(1)

          def ready = false
          for (int attempt = 0; attempt < 15; attempt++) {
            def result = bat(
              returnStatus: true,
              script: '@curl.exe --fail --silent --show-error --output NUL "http://127.0.0.1:%CI_FRONTEND_PORT%/health"'
            )
            if (result == 0) {
              ready = true
              break
            }
            sleep(time: 2, unit: 'SECONDS')
          }
          if (!ready) {
            error('Frontend container did not become ready for the smoke test.')
          }

          bat 'curl.exe --fail --silent --show-error --output NUL "http://127.0.0.1:%CI_FRONTEND_PORT%/"'
          bat 'curl.exe --fail --silent --show-error --output NUL "http://127.0.0.1:%CI_FRONTEND_PORT%/products"'
          bat 'curl.exe --fail --silent --show-error --output NUL "http://127.0.0.1:%CI_FRONTEND_PORT%/admin/dashboard"'
        }
      }
    }
  }

  post {
    always {
      script {
        if (env.CI_FRONTEND_CONTAINER) {
          bat(returnStatus: true, script: '@docker rm -f "%CI_FRONTEND_CONTAINER%"')
        }
        if (env.CI_COMPOSE_PROJECT) {
          bat(returnStatus: true, script: 'docker compose -f "%CI_COMPOSE_FILE%" -p "%CI_COMPOSE_PROJECT%" down --remove-orphans')
        }
      }
    }
  }
}
