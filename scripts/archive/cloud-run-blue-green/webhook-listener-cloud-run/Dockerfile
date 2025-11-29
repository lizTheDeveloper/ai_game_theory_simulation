# Webhook listener for blue-green deployments
# Runs on Cloud Run, triggers gcloud commands via service account

FROM node:18-alpine

# Install gcloud CLI (required for deployment commands)
RUN apk add --no-cache curl python3 bash git && \
    curl -sSL https://sdk.cloud.google.com | bash

ENV PATH="/root/google-cloud-sdk/bin:${PATH}"

WORKDIR /app

# Copy package files
COPY package*.json ./

# No dependencies to install (pure Node.js stdlib)

# Copy application
COPY index.js ./

EXPOSE 8080

CMD ["node", "index.js"]
