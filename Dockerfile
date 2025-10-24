# Dockerfile for Super Alignment to Utopia Simulation Dashboard
# Optimized for Google Cloud Run deployment

# Use official Node.js runtime as base image
FROM node:20-slim AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json ./

# Copy local packages (needed for @lizthedeveloper/government-agents)
COPY packages ./packages

# Build local packages before npm install
RUN cd packages/government-agents && npm install && npm run build

# Install dependencies
# Using npm install instead of npm ci since package-lock.json may not exist
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies and built packages from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages

# Copy source code
COPY . .

# Build Next.js application
# This will create an optimized production build
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port (Cloud Run will set PORT env var)
EXPOSE 3333

# Set port
ENV PORT=3333
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
