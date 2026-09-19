FROM node:20-alpine AS deps
WORKDIR /app
COPY services/product-service/package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runtime
WORKDIR /app/services/product-service
COPY --from=deps /app/node_modules ./node_modules
COPY services/product-service/src ./src
COPY proto /app/proto
CMD ["node", "src/index.js"]
