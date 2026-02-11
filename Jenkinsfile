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
        DOCKER_HUB_REPO = 'abdosblz/camunda-doc-gen'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build and Push Image') {
            steps {
                container('kaniko') {
                    sh "/kaniko/executor --context `pwd` --destination ${DOCKER_HUB_REPO}:${IMAGE_TAG} --destination ${DOCKER_HUB_REPO}:latest"
                }
            }
        }
    }
}
