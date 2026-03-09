# Dockerfile for Review App
# Build stage for client
FROM node:18 AS client-build
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm install
COPY client ./
RUN npm run build

# Build stage for server
FROM node:18 AS server-build
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm install
COPY server ./

# Production image
FROM node:18 AS production
WORKDIR /app
COPY --from=client-build /app/client/build ./client/build
COPY --from=server-build /app/server ./server
EXPOSE 3000 4000
CMD ["node", "server/index.js"]
