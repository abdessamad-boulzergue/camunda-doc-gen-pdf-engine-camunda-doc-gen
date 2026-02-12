# Stage 1: Build the Angular application
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

COPY --from=build /app/dist/camunda-doc-gen/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the entrypoint script
COPY entrypoint.sh /docker-entrypoint.d/40-envsubst.sh

# Make sure the script is executable
RUN chmod +x /docker-entrypoint.d/40-envsubst.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
