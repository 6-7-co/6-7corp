# syntax=docker/dockerfile:1

# ---- Build stage: compile the client bundle ------------------------------
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY client ./client
COPY server ./server
# Path of the private content area, supplied at build time (no default):
#   docker build --build-arg VITE_ADMIN_PATH=my-private-panel .
ARG VITE_ADMIN_PATH=""
ENV VITE_ADMIN_PATH=$VITE_ADMIN_PATH
ENV VITE_ADMIN_PATH=$VITE_ADMIN_PATH
RUN npm ci
RUN npm -w client run build

# ---- Runtime stage: single process serving API + built client ------------
# The Fastify server serves client/dist, the API and /uploads from one port,
# with one CSP — the same setup verified locally.
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001
COPY package.json package-lock.json ./
COPY server ./server
COPY --from=build /app/client/dist ./client/dist
RUN npm ci --omit=dev && npm cache clean --force
# SQLite data + uploaded media are persisted via volumes (see compose).
EXPOSE 3001
CMD ["npm", "-w", "server", "run", "start"]
