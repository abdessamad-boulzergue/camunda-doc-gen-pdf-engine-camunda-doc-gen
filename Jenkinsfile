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
    parameters {
        booleanParam(name: 'IS_RELEASE', defaultValue: false, description: 'Check this to create a release branch and bump version')
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
        stage('Release') {
            when {
                expression { params.IS_RELEASE == true }
            }
            steps {
                withCredentials([usernamePassword(
                  credentialsId: 'github-repo',
                  usernameVariable: 'GIT_USERNAME',
                  passwordVariable: 'GIT_TOKEN'
                )]) {
                    sh """
                        # Configure git
                        git config user.email "jenkins@example.com"
                        git config user.name "Jenkins"
                        git remote set-url origin https://${GIT_USERNAME}:${GIT_TOKEN}@github.com/${GIT_USERNAME}/camunda-doc-gen-pdf-engine-camunda-doc-gen.git

                        # Create and push release branch
                        git checkout -b release/${IMAGE_TAG}
                        git push origin release/${IMAGE_TAG}

                        # Switch back to original branch (assuming we are on a detached head, we need to checkout the branch name)
                        # Ensure we are on the correct branch for bumping version
                        git checkout ${env.BRANCH_NAME}

                        # Bump version in package.json (increment patch)
                        # naive increment: split by dot, increment last part
                        
                        NEW_VERSION=\$(echo ${IMAGE_TAG} | awk -F. '{\$NF = \$NF + 1;} 1' | sed 's/ /./g')
                        
                        # Update package.json
                        sed -i "s/\"version\": \"${IMAGE_TAG}\"/\"version\": \"\$NEW_VERSION\"/" package.json

                        # Commit and push version bump
                        git commit -am "chore: bump version to \$NEW_VERSION"
                        git push origin ${env.BRANCH_NAME}
                    """
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
                git config user.email "jenkins@example.com"

                git commit -am "Update image to ${IMAGE_TAG}"
                git push
              """
            }
          }
        }
    }
}
