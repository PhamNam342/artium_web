# 1. Build Environment
FROM node:20-alpine AS builder

WORKDIR /app

# Dùng package*.json để Docker không bị bắt buộc tìm file package-lock.json
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# 2. Production Environment
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# Đổi npm ci -> npm install --omit=dev
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]