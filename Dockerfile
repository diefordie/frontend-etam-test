# Gunakan Node.js versi LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci && npm i sharp

# Install dependensi build tambahan
RUN apk add --no-cache libc6-compat

# Copy seluruh kode sumber
COPY . .

# Build aplikasi Next.js
RUN npm run build

# Expose port yang digunakan (biasanya 3000 untuk Next.js)
EXPOSE 3000

# Tambahkan variabel lingkungan jika diperlukan
# ENV NODE_ENV=production

# Command untuk menjalankan aplikasi
CMD ["npm", "run", "start"]
