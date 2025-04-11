# Minimal Tool Stack for Browser-Based Translation System

## 1. Frontend
### Core Framework
- **React** - UI framework
- **Vite** - Build tool (faster than Create React App)
- **TypeScript** - Type safety

### UI Components
- **Tailwind CSS** - Utility-first CSS
- **DaisyUI** - Component library
- **React Router** - Navigation
- **Zustand** - State management

### Browser APIs
- **Web Speech API** - Speech recognition and synthesis
- **Web Audio API** - Audio processing
- **EventSource** - Server-Sent Events for text updates
- **IndexedDB** - Local storage

## 2. Backend
### Core Server
- **Node.js** - Runtime
- **Express** - Web framework
- **EventSource** - Server-Sent Events implementation

### Translation
- **LibreTranslate** - Open-source translation
- **Redis** - Caching translations

### Database
- **PostgreSQL** - User data and sessions
- **Prisma** - ORM

## 3. Development Tools
### Code Quality
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks

### Testing
- **Vitest** - Testing framework
- **React Testing Library** - Component testing
- **Cypress** - E2E testing

## 4. Deployment
### Hosting
- **Vercel** - Frontend hosting (includes SSL, CDN, and automatic deployments)
- **Railway** - Backend hosting (includes database and Redis)

### CI/CD
- **GitHub Actions** - Automated testing and deployment
- **Vercel CLI** - Local development and deployment

## 5. Monitoring
- **Sentry** - Error tracking
- **Vercel Analytics** - Performance monitoring
- **PostHog** - User analytics

## Implementation Notes

### Frontend Setup
```bash
# Create new project
npm create vite@latest translation-app -- --template react-ts

# Install dependencies
npm install @daisyui/react tailwindcss postcss autoprefixer
npm install react-router-dom zustand

# Install Vercel CLI
npm install -g vercel
```

### Backend Setup
```bash
# Initialize project
npm init -y
npm install express prisma @prisma/client
npm install libretranslate-node redis

# Initialize Prisma
npx prisma init

# Deploy to Railway
railway up
```

### Development Workflow
1. Start frontend: `npm run dev`
2. Start backend: `npm run dev`
3. Run tests: `npm test`
4. Deploy frontend: `vercel`
5. Deploy backend: `railway up`

## Communication Flow
```
Host Browser -> Web Speech API -> Server -> Translation -> SSE -> Client Browser -> Web Speech API (TTS)
```

### Key Communication Points
1. **Host to Server**:
   - HTTP POST for session management
   - Text data from Web Speech API

2. **Server to Clients**:
   - SSE for real-time text updates
   - Translated content delivery

3. **Client Processing**:
   - Web Speech API for TTS
   - Local state management

## Minimal Server Requirements
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB SSD
- Network: 100Mbps

## Browser Support
- Chrome 89+
- Firefox 86+
- Safari 14.1+
- Edge 89+

## Security Considerations
- HTTPS required
- CORS configuration
- Rate limiting
- Input validation
- Secure headers 