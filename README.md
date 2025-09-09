# Parallel Trail

A retro-styled roguelike deck-builder web game set in Phoenix, Arizona. Follow Penelope "Penny" Torres as she navigates time loops and parallel universes after a mysterious car accident.

## 🎮 Game Features

- **Retro Aesthetic**: Oregon Trail-inspired text UI with pixel-perfect graphics
- **Deck-Building**: Collect and manage cards across four categories (Timecraft, Mind/Resolve, Social, Physical)
- **Roguelike Elements**: Procedural events, permadeath with meta-progression
- **Narrative Branching**: Multiple endings based on choices across timeline loops
- **Phoenix Setting**: Explore real-world locations (Roosevelt Row, South Mountain, Tempe Town Lake)

## 🛠️ Tech Stack

- **Frontend**: TypeScript + Phaser 3 + Vite
- **Styling**: Retro 1-bit/4-color palettes with CRT effects
- **Build**: Vite for development, Nginx for production
- **Containerization**: Docker/Podman for development and deployment
- **Testing**: Vitest (unit) + Playwright (integration)

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run with hot reload on network
npm run dev -- --host 0.0.0.0
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality
```bash
# Run all validation checks
npm run validate

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Type checking
npm run type-check
```

## 🐳 Container Development

### Using Docker/Podman
```bash
# Development container
podman-compose up parallel-trail-dev

# Production container
podman-compose up parallel-trail-prod

# Both services
podman-compose up
```

### Container Ports
- **Development**: http://localhost:5173
- **Production**: http://localhost:8080

## 📁 Project Structure

```
src/
├── game/           # Game configuration and core setup
├── scenes/         # Phaser scenes (Boot, Title, Hub, etc.)
├── entities/       # Game entities (Player, Card, NPC, etc.)
├── systems/        # Game systems (Combat, Events, UI, etc.)
├── utils/          # Utility functions and helpers
├── types/          # TypeScript type definitions
└── assets/         # Game assets (images, audio, data)
```

## 🎯 Development Workflow

### 🛡️ Branch Protection (Applied)
The main branch is protected with enterprise-grade security:
- **Required PR Reviews**: 1 approving review required
- **Status Checks**: `npm run validate` must pass before merge
- **Force Push Protection**: Prevents history rewriting
- **Branch Deletion Protection**: Prevents accidental loss

### 📋 Standard Workflow
1. **Feature Branches**: Create feature branches from `main`
2. **Issue Tracking**: Reference GitHub issues in commits
3. **Code Quality**: All code must pass `npm run validate`
4. **Pull Requests**: Submit PRs for review before merging
5. **Testing**: Maintain >80% test coverage for critical systems

### 🚀 Task-Based Development
Follow the established pattern: `00X-task-name` branches for systematic development.
See [CLAUDE_COMMIT_WORKFLOW.md](CLAUDE_COMMIT_WORKFLOW.md) for detailed workflow instructions.

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🚀 Deployment

The project is configured for deployment to **Zeabur.com** using container-based deployment:

1. **Build**: Automated via GitHub Actions
2. **Container**: Production Docker image with Nginx
3. **Deploy**: Automatic deployment on successful build
4. **URL**: HTTPS enabled with custom domain support

## 📋 Development Status

- ✅ **Phase 1**: Specification Complete
- ✅ **Phase 2**: Planning Complete  
- 🚧 **Phase 3**: Development In Progress
- ⏳ **Phase 4**: Testing & Deployment

## 📝 License

This project is part of the Spec-Driven Development methodology implementation.

---

**Generated with [Claude Code](https://claude.ai/code)** 🤖