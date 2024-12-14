# Stage 1: Build
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy seluruh kode sumber
COPY . .

# Set NODE_ENV ke production
ENV NODE_ENV production

# Build aplikasi Next.js
RUN npm run build

# Stage 2: Run
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built assets dari builder stage
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Set NODE_ENV ke production
ENV NODE_ENV production

# Expose port yang digunakan (biasanya 3000 untuk Next.js)
EXPOSE 3000

# Command untuk menjalankan aplikasi
CMD ["npm", "start"]