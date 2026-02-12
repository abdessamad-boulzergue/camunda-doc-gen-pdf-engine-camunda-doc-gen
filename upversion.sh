
NEW_VERSION=0.0.4
sed -i "s/\"version\": \"${IMAGE_TAG}\"/\"version\": \"${NEW_VERSION}\"/" package.json
