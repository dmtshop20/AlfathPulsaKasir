FROM node:20-slim

WORKDIR /app

# Install openssl (required by Prisma Client to connect with Supabase SSL)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package management files first to utilize Docker layer caching
COPY package*.json ./

# Copy prisma schema for generator
COPY prisma ./prisma

# Install all dependencies
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the app (compiles react frontend and TS backend)
RUN npm run build

# Prune devDependencies to keep container size ultra-lean before running
RUN npm prune --production

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
