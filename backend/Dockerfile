# 1. Build Environment
FROM node:20-alpine AS builder

WORKDIR /app

# Copy chính xác cả 2 file để tránh lỗi thiếu package-lock.json
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build


# 2. Production Environment
FROM node:20-alpine

WORKDIR /app

# Copy chính xác cả 2 file cho môi trường production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
