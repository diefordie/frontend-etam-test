# Stage 1: Install dependencies
FROM node:18-alpine as dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:18-alpine as builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Run the application
FROM node:18-alpine as runner
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built assets from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Install sharp for image optimization
RUN npm i sharp

# Install additional build dependencies
RUN apk add --no-cache libc6-compat

# Expose port 3000
EXPOSE 3000

# Set environment variables
ENV NODE_ENV production

# Run the application
CMD ["npm", "start"]
