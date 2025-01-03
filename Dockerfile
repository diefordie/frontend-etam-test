# Stage 1: Install dependencies
FROM node:18-alpine as dependencies
WORKDIR /app
COPY package.json package-lock.json ./
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

# Copy package.json
COPY package.json package-lock.json ./

# Install production dependencies only and sharp for image optimization
RUN npm install --only=production && npm install sharp

# Copy built assets from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose port 3000
EXPOSE 3000

# Set environment variables
ENV NODE_ENV production

# Run the application with next start
CMD ["npx", "next", "start"]
