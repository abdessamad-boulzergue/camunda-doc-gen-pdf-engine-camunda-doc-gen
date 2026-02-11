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
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        IMAGE_NAME="camunda-doc-gen"
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
                def version = sh(script: "grep '\"version\":' package.json | cut -d'\"' -f4", returnStdout: true).trim()
                env.APP_VERSION = version
                IMAGE_TAG = env.APP_VERSION
              }
            }
          }

        stage('Build and Push Image') {
            steps {
                echo "Built image with tag: ${IMAGE_NAME}:${IMAGE_TAG}"
                container('kaniko') {
                    sh "/kaniko/executor --context `pwd` --destination ${DOCKER_HUB_REPO}/${IMAGE_NAME}:${IMAGE_TAG} --destination ${DOCKER_HUB_REPO}/${IMAGE_NAME}:latest"
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

                sed -i "s|image: .*|image: docker.io/${DOCKER_HUB_REPO}/${IMAGE_NAME}:${IMAGE_TAG}|g" deployment.yaml

                git config user.name ${GIT_USERNAME}
                git config user.email "ci@local"

                git commit -am "Update image to ${IMAGE_TAG}"
                git push
              """
            }
          }
        }
    }
}
