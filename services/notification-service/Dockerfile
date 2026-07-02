FROM --platform=linux/arm64 node:20-alpine AS deps
WORKDIR /app
COPY services/notification-service/package*.json ./
RUN npm ci --omit=dev

FROM --platform=linux/arm64 node:20-alpine AS runtime
WORKDIR /app/services/notification-service
COPY --from=deps /app/node_modules ./node_modules
COPY services/notification-service/src ./src
COPY proto /app/proto
CMD ["node", "src/index.js"]
