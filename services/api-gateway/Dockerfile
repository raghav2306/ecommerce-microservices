FROM --platform=linux/arm64 node:20-alpine AS deps
WORKDIR /app
COPY services/api-gateway/package*.json ./
RUN npm ci --omit=dev

FROM --platform=linux/arm64 node:20-alpine AS runtime
WORKDIR /app/services/api-gateway
COPY --from=deps /app/node_modules ./node_modules
COPY services/api-gateway/src ./src
COPY proto /app/proto
EXPOSE 3000
CMD ["node", "src/index.js"]
