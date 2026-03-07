# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build --configuration=production

# Serve stage
FROM nginx:alpine

# Copy built Angular files to NGINX HTML folder
COPY --from=builder /app/dist/angular-app/browser /usr/share/nginx/html

# Custom NGINX config to handle Angular Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
