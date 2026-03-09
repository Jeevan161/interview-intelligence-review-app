# Review App Docker Guide

## Overview
This guide explains how to build and run the Review App using Docker. The app consists of a React client and a Node.js server.

## Prerequisites
- Docker installed on your machine
- Node.js (for local development, optional)

## Build Docker Image
Navigate to the root of your workspace and run:

```
docker build -t review-app:latest -f review-app/Dockerfile .
```

This command builds the Docker image for the Review App using the Dockerfile in the `review-app` directory.

## Run Docker Container
After building the image, run the container:

```
docker run -p 3000:3000 -p 5000:5000 review-app:latest
```

- The client will be available on port 3000.
- The server will be available on port 5000.

## Context
- The Dockerfile builds the React client and Node.js server separately, then combines them in a production image.
- The GitHub Actions workflow automates build, test, and Docker image creation for CI/CD.

## Additional Notes
- Update environment variables as needed in the server or client directories.
- For deployment, add steps to the GitHub Actions workflow as required.

## Troubleshooting
- Ensure ports 3000 and 5000 are not in use.
- Check Docker logs for errors: `docker logs <container_id>`

---
For more details, see the Dockerfile and workflow YAML in the `review-app` directory.
