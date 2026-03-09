# Dockerfile for Review App
# Build stage for client
FROM node:18 AS client-build
WORKDIR /app/client
COPY review-app/client/package.json review-app/client/package-lock.json ./
RUN npm install
COPY review-app/client ./
RUN npm run build

# Build stage for server
FROM node:18 AS server-build
WORKDIR /app/server
COPY review-app/server/package.json review-app/server/package-lock.json ./
RUN npm install
COPY review-app/server ./

# Production image
FROM node:18 AS production
WORKDIR /app
COPY --from=client-build /app/client/build ./client/build
COPY --from=server-build /app/server ./server
EXPOSE 3000 5000
CMD ["node", "server/index.js"]
