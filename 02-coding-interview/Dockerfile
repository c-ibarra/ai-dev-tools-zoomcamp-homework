# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm install

COPY client/ ./
RUN npm run build

# Stage 2: Production container running Express backend + static frontend
FROM node:20-alpine
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3001

# Install production dependencies for server
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy backend application source
COPY server/ ./server/

# Copy compiled frontend from builder stage
COPY --from=frontend-builder /app/client/dist ./client/dist

# Expose single application port
EXPOSE 3001

# Launch full-stack application
CMD ["node", "server/index.js"]
