#!/bin/bash

# Deployment script for Parallel Trail
# Usage: ./scripts/deploy.sh [environment] [version]

set -e

# Default values
ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}
REGISTRY="ghcr.io"
REPOSITORY="omarbizkit/parallel-trail"

echo "🚀 Starting deployment to $ENVIRONMENT environment..."

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo "❌ Error: Environment must be 'staging' or 'production'"
    exit 1
fi

# Check for required tools
echo "📋 Checking required tools..."
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed."; exit 1; }
command -v zeabur >/dev/null 2>&1 || { echo "⚠️  Zeabur CLI not found. Install with: curl -fsSL https://raw.githubusercontent.com/zeabur/cli/main/install.sh | bash"; }

# Load environment variables
if [ -f .env.local ]; then
    echo "🔧 Loading environment variables from .env.local..."
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Validate required environment variables
if [[ -z "$ZEABUR_API_TOKEN" ]]; then
    echo "❌ Error: ZEABUR_API_TOKEN is required"
    exit 1
fi

if [[ "$ENVIRONMENT" == "production" && -z "$ZEABUR_PROJECT_ID" ]]; then
    echo "❌ Error: ZEABUR_PROJECT_ID is required for production deployment"
    exit 1
fi

if [[ "$ENVIRONMENT" == "staging" && -z "$ZEABUR_STAGING_PROJECT_ID" ]]; then
    echo "❌ Error: ZEABUR_STAGING_PROJECT_ID is required for staging deployment"
    exit 1
fi

# Build the application
echo "🏗️  Building application..."
npm run build

# Build Docker image
echo "🐳 Building Docker image..."
IMAGE_TAG="$REGISTRY/$REPOSITORY:$ENVIRONMENT-$VERSION"

docker build -f Dockerfile.prod -t "$IMAGE_TAG" .

# Push to container registry
echo "📤 Pushing image to container registry..."
echo "$GITHUB_TOKEN" | docker login $REGISTRY -u ${{ github.actor }} --password-stdin
docker push "$IMAGE_TAG"

# Deploy to Zeabur
echo "🚀 Deploying to Zeabur..."
echo "$ZEABUR_API_TOKEN" | zeabur auth login

if [[ "$ENVIRONMENT" == "production" ]]; then
    PROJECT_ID="$ZEABUR_PROJECT_ID"
    SERVICE_NAME="parallel-trail"
    ENV="NODE_ENV=production"
else
    PROJECT_ID="$ZEABUR_STAGING_PROJECT_ID"
    SERVICE_NAME="parallel-trail-staging"
    ENV="NODE_ENV=staging"
fi

echo "Deploying to $ENVIRONMENT environment..."
zeabur deploy \
    --project-id "$PROJECT_ID" \
    --service-name "$SERVICE_NAME" \
    --image "$IMAGE_TAG" \
    --env "$ENV" \
    --env "PORT=8080"

# Get deployment URL
DEPLOY_URL=$(zeabur service get "$SERVICE_NAME" --project-id "$PROJECT_ID" --format json | jq -r '.url')

echo "✅ Deployment completed successfully!"
echo "🌐 Application deployed to: $DEPLOY_URL"
echo "📊 Environment: $ENVIRONMENT"
echo "🏷️  Version: $VERSION"

# Optional: Open in browser
if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$DEPLOY_URL"
elif command -v open >/dev/null 2>&1; then
    open "$DEPLOY_URL"
fi

echo "🎉 Deployment process completed!"}