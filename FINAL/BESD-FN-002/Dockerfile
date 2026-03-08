# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package config and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY tsconfig*.json ./
COPY src/ ./src/
RUN npm run build

# Run stage
FROM node:18-alpine

WORKDIR /app

# Only copy over the built output and package config
COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Adjust the start command if necessary based on package.json
CMD ["npm", "start"]
