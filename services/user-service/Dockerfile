FROM --platform=linux/arm64 node:20-alpine AS deps
WORKDIR /app
COPY services/user-service/package*.json ./
RUN npm ci --omit=dev

FROM --platform=linux/arm64 node:20-alpine AS runtime
WORKDIR /app/services/user-service
COPY --from=deps /app/node_modules ./node_modules
COPY services/user-service/src ./src
COPY proto /app/proto
CMD ["node", "src/index.js"]
