# Deployment Guide for Parallel Trail

This guide covers the complete deployment setup for Parallel Trail, including GitHub Actions, Zeabur configuration, and container registry management.

## 🚀 Quick Start

1. **Set up secrets** in your GitHub repository
2. **Configure Zeabur** environments and projects
3. **Deploy automatically** via GitHub Actions or manually using scripts

## 📋 Prerequisites

### Required Accounts
- GitHub account with repository access
- Zeabur account (https://zeabur.com)
- Docker Hub or GitHub Container Registry access

### Required Tools
- Docker or Podman
- Node.js 18+
- Git

## 🔐 Setting Up Secrets

### GitHub Repository Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

#### Repository Secrets
```bash
# Codecov token for coverage reporting (optional)
CODECOV_TOKEN=your_codecov_token_here
```

#### Environment Secrets

**Staging Environment:**
```bash
ZEABUR_API_TOKEN=your_zeabur_api_token_here
ZEABUR_STAGING_PROJECT_ID=your_staging_project_id_here
GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }}  # Automatically provided
```

**Production Environment:**
```bash
ZEABUR_API_TOKEN=your_zeabur_api_token_here
ZEABUR_PROJECT_ID=your_production_project_id_here
GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }}  # Automatically provided
```

### Getting Zeabur API Token

1. Go to [Zeabur Dashboard](https://zeabur.com)
2. Navigate to Settings → API Tokens
3. Create a new API token with deployment permissions
4. Copy the token and add it to GitHub secrets

### Getting Zeabur Project IDs

1. Create projects in Zeabur for staging and production
2. Go to each project settings
3. Copy the Project ID and add to GitHub secrets

## 🔧 Environment Configuration

### GitHub Environments Setup

1. Go to Settings → Environments in your GitHub repository
2. Create two environments: `staging` and `production`
3. Configure protection rules:
   - **Staging**: Deploy from `develop` branch
   - **Production**: Deploy from `main` branch with required reviewers

### Local Environment Setup

Copy the example environment file and configure:

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

## 🐳 Container Configuration

### Multi-stage Docker Build

The production Dockerfile uses a multi-stage build:

1. **Builder stage**: Installs dependencies and builds the application
2. **Production stage**: Uses Nginx to serve the built application
3. **Security**: Runs as non-root user with health checks

### Container Registry

Images are automatically built and pushed to GitHub Container Registry:

```
ghcr.io/omarbizkit/parallel-trail:latest     # Production
ghcr.io/omarbizkit/parallel-trail:dev        # Development
ghcr.io/omarbizur/parallel-trail:main-{sha}  # Specific commit
```

## 🚀 Deployment Process

### Automatic Deployment (Recommended)

Deployments happen automatically via GitHub Actions:

1. **Push to `develop`**: Deploys to staging environment
2. **Push to `main`**: Deploys to production environment
3. **Pull Requests**: Runs tests and builds but doesn't deploy

### Manual Deployment

Use the deployment script for manual deployments:

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production

# Deploy specific version
./scripts/deploy.sh production v1.2.3
```

### Manual Container Deployment

```bash
# Build and run locally
docker build -f Dockerfile.prod -t parallel-trail:latest .
docker run -p 8080:8080 parallel-trail:latest

# Using podman-compose
podman-compose up parallel-trail-prod
```

## 🏗️ Deployment Environments

### Staging Environment
- **URL**: `https://staging.parallel-trail.zeabur.app`
- **Branch**: `develop`
- **Purpose**: Testing and validation
- **Auto-deploy**: Yes, on push to develop

### Production Environment  
- **URL**: `https://parallel-trail.zeabur.app`
- **Branch**: `main`
- **Purpose**: Live application
- **Auto-deploy**: Yes, on push to main with approval

## 📊 Monitoring and Health Checks

### Health Check Endpoint
The application includes a health check endpoint at `/` that verifies:
- Application is running
- Nginx is responding
- Static assets are accessible

### Container Health Checks
Docker containers include health checks that:
- Run every 30 seconds
- Timeout after 10 seconds
- Retry 3 times before marking as unhealthy

### Monitoring Integration
The deployment includes:
- Application performance monitoring
- Error tracking (when Sentry is configured)
- Uptime monitoring via Zeabur

## 🔧 Configuration Files

### Key Configuration Files
- `.github/workflows/ci-cd.yml` - GitHub Actions workflow
- `zeabur.yml` - Zeabur deployment configuration
- `Dockerfile.prod` - Production container definition
- `nginx.conf` - Nginx web server configuration
- `deploy/config.yml` - Deployment settings

### Environment Variables
- `NODE_ENV`: Environment (development/staging/production)
- `PORT`: Application port (5173/8080)
- `ZEABUR_API_TOKEN`: Zeabur API authentication
- `ZEABUR_PROJECT_ID`: Target project ID

## 🚨 Troubleshooting

### Common Issues

1. **Deployment fails with authentication error**
   - Verify Zeabur API token is correct
   - Check GitHub secrets are properly configured

2. **Container build fails**
   - Ensure all dependencies are properly installed
   - Check Docker and Node.js versions

3. **Health checks fail**
   - Verify application builds successfully
   - Check port configuration matches container settings

4. **Environment variables not loading**
   - Verify `.env.local` file exists and is properly configured
   - Check that secrets are set in GitHub environments

### Debug Commands

```bash
# Check container logs
docker logs parallel-trail-prod

# Test health check manually
curl -f http://localhost:8080/ || exit 1

# Validate configuration
node scripts/validate-config.js

# Check deployment status
zeabur service get parallel-trail --project-id YOUR_PROJECT_ID
```

## 📈 Performance Optimization

### Container Optimizations
- Multi-stage builds reduce image size
- Non-root user for security
- Health checks for reliability
- Proper resource limits

### Application Optimizations
- Gzip compression enabled
- Static asset caching
- CDN integration ready
- Code splitting for faster loads

## 🔒 Security Considerations

### Container Security
- Runs as non-root user
- Minimal base image (Alpine Linux)
- No unnecessary packages
- Regular security updates

### Application Security
- Environment variables for sensitive data
- HTTPS enforcement
- Security headers via Nginx
- Input validation and sanitization

## 🔄 Continuous Deployment

The deployment pipeline includes:
1. **Code Quality Checks**: Linting, type checking, formatting
2. **Security Scanning**: Dependency audit, CodeQL analysis
3. **Testing**: Unit tests with coverage reporting
4. **Building**: Multi-platform container images
5. **Deployment**: Automated deployment to Zeabur
6. **Monitoring**: Health checks and status reporting

## 📞 Support

For deployment issues:
1. Check GitHub Actions logs
2. Review Zeabur dashboard
3. Verify container registry access
4. Consult this documentation
5. Open an issue in the repository

---

**Last Updated**: $(date)
**Version**: 1.0.0
**Maintainer**: @omarbizkit

**Generated with [Claude Code](https://claude.ai/code)** 🤖