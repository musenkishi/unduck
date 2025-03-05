# syntax=docker/dockerfile:1

###############################
# Stage 1: Build the Application
###############################
FROM node:22.14.0-alpine AS builder

# Set environment variable
ENV NODE_ENV=production

# Install pnpm@10 globally
RUN npm install -g pnpm@10

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml to leverage Docker cache
COPY ../package.json ../pnpm-lock.yaml ./

# Install dependencies (including devDependencies)
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY .. .

# Build the application
RUN pnpm run build

###############################
# Stage 2: Download Caddy Static Binary
###############################
FROM alpine:3.18 AS caddy_setup

# Install wget
RUN apk add --no-cache wget

# Define Caddy version (update to the latest stable version as needed)
ENV CADDY_VERSION=2.6.4

# Download and extract Caddy
RUN wget https://github.com/caddyserver/caddy/releases/download/v${CADDY_VERSION}/caddy_${CADDY_VERSION}_linux_amd64.tar.gz -O /tmp/caddy.tar.gz && \
    tar -xzvf /tmp/caddy.tar.gz -C /tmp && \
    mv /tmp/caddy /usr/local/bin/caddy && \
    chmod +x /usr/local/bin/caddy && \
    rm -rf /tmp/*

###############################
# Stage 3: Production Image (Distroless with Caddy)
###############################
FROM gcr.io/distroless/static-debian12

# Set environment variable
ENV NODE_ENV=production

# Set working directory
WORKDIR /usr/src/app

# Copy built assets from builder stage
COPY --from=builder /usr/src/app/dist /usr/src/app/dist

# Copy Caddy binary from caddy_setup stage
COPY --from=caddy_setup /usr/local/bin/caddy /usr/local/bin/caddy

# Copy Caddyfile
COPY /docker/Caddyfile /etc/caddy/Caddyfile

# Expose port 80
EXPOSE 80

# Specify the command to run Caddy
CMD ["/usr/local/bin/caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]