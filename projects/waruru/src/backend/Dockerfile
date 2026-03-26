# Stage 1: builder
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY src/ ./src/
COPY tsconfig*.json ./

RUN npm run build

# Stage 2: runner
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

USER node

EXPOSE 3000

CMD ["node", "dist/main"]
