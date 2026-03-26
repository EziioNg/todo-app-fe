# ===== Stage 1: Build =====
FROM node:20-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_ROOT
ENV NEXT_PUBLIC_API_ROOT=$NEXT_PUBLIC_API_ROOT

# Copy package files
COPY package.json package-lock.json ./

# Install deps
RUN npm ci

# Copy source
COPY . .

# Build app
RUN rm -rf .next
RUN npm run build


# ===== Stage 2: Production =====
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]