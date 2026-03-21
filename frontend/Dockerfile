FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Script que reemplaza el puerto dinámicamente al iniciar
COPY docker-entrypoint-nginx.sh /docker-entrypoint-nginx.sh
RUN chmod +x /docker-entrypoint-nginx.sh

EXPOSE 8080
CMD ["/docker-entrypoint-nginx.sh"]