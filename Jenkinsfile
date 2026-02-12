pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
metadata:
  labels:
    some-label: some-value
spec:
  containers:
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    command:
    - cat
    tty: true
    volumeMounts:
      - name: docker-config
        mountPath: /kaniko/.docker
  volumes:
    - name: docker-config
      secret:
        secretName: dockerhub-secret
        items:
          - key: .dockerconfigjson
            path: config.json
"""
        }
    }

    environment {
        // Update these values with your actual Docker Hub username and repository name
        DOCKER_HUB_REPO = 'abdosblz'
        IMAGE_NAME='camunda-doc-gen'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Read Version') {
          steps {
            script {
              def version = sh(
                script: "node -p \"require('./package.json').version\"",
                returnStdout: true
              ).trim()

              echo "Package version is ${version}"

              env.APP_VERSION = version
              env.IMAGE_TAG = "${env.APP_VERSION}-${env.BUILD_NUMBER}"

              echo "New version is ${env.IMAGE_TAG}"
            }
          }
        }

        stage('Build and Push Image') {
            steps {
                container('kaniko') {
                    sh "/kaniko/executor --context `pwd` --destination ${DOCKER_HUB_REPO}/${IMAGE_NAME}:${env.IMAGE_TAG} --destination ${DOCKER_HUB_REPO}/${IMAGE_NAME}:latest"
                }
            }
        }
        stage('Update GitOps') {
          steps {
            withCredentials([usernamePassword(
              credentialsId: 'github-repo',
              usernameVariable: 'GIT_USERNAME',
              passwordVariable: 'GIT_TOKEN'
            )]) {
              sh """
                git clone https://${GIT_USERNAME}:${GIT_TOKEN}@github.com/${GIT_USERNAME}/camunda-doc-argocd.git
                cd camunda-doc-argocd

                sed -i "s|image: .*|image: docker.io/${DOCKER_HUB_REPO}/${IMAGE_NAME}:${env.IMAGE_TAG}|g" deployment.yaml

                git config user.name ${GIT_USERNAME}
                git config user.email "jenkins@example.com"

                git commit -am "Update image to ${env.IMAGE_TAG}"
                git push
              """
            }
          }
        }
    }
}
