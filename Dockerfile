# Stage 1: Build the application
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy prisma directory (needed for npm install / prisma generate in postinstall)
COPY prisma ./prisma

# Install all dependencies
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the frontend and compiled server
RUN npm run build

# Prune development dependencies to keep memory footprint ultra-lean
RUN npm prune --production

# Stage 2: Minimal runner stage
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built code and required engines/dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Expose port 3000
EXPOSE 3000

# Run the app
CMD ["npm", "run", "start"]
