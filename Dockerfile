FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Install dependencies termasuk sharp
RUN npm install && npm install sharp

COPY . .

ENV NODE_ENV=production

# Build aplikasi Next.js
RUN npm run build

# Stage 2: Run
FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]