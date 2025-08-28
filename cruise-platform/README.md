# Cruise Platform - Desktop AI Entrepreneurship Accelerator

Cruise is a sophisticated desktop application that acts as an AI-powered accelerator for startup founders. Built with Electron, React, and Node.js, it provides a seamless, guided journey from ideation to market-ready products.

## 🚀 Features

- **AI-Powered Ideation**: Conversational AI assistant for idea development
- **Real-time Web Scraping**: Market research and competitor analysis
- **LinkedIn Integration**: Automated outreach and networking
- **Pitch Deck Generator**: AI-driven presentation creation
- **Product Roadmapping**: Strategic planning and milestone tracking
- **Meeting Assistant**: Live meeting transcription and analysis
- **Glassmorphism UI**: Modern, Apple-inspired interface design

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Electron 25** for desktop app framework
- **Tailwind CSS** for styling
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** for database
- **JWT** for authentication

### Desktop Features
- **Electron Store** for persistent data
- **Native dialogs** for file operations
- **System notifications**
- **Auto-updater** support
- **Cross-platform** (Windows, macOS, Linux)

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **PostgreSQL** (for database)
- **Git**

## 🔧 Installation & Setup

### Quick Start (Windows)
```bash
# Clone the repository
git clone https://github.com/yourusername/cruise-platform.git
cd cruise-platform

# Run the development setup script
start-dev.bat
```

### Manual Setup

1. **Install dependencies**:
```bash
npm install
cd frontend && npm install && cd ..
```

2. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Set up the database**:
```bash
# Run migrations
npm run migrate

# Seed initial data
npm run seed
```

4. **Build the backend**:
```bash
npm run backend:build
```

5. **Start development**:
```bash
npm run start
```

## 🚀 Running the Application

### Development Mode
```bash
# Start all services (backend + frontend + electron)
npm run start

# Or start services individually:
npm run backend:dev    # Start backend only
npm run frontend:start # Start frontend only
npm run electron:dev   # Start electron only
```

### Production Build
```bash
# Build for production
npm run build

# Create distributable packages
npm run dist
```

## 📁 Project Structure

```
cruise-platform/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   └── utils/           # Helper functions
│   ├── migrations/          # Database migrations
│   └── seeds/              # Initial data
├── frontend/               # React.js application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API and utility services
│   │   ├── hooks/          # Custom React hooks
│   │   ├── styles/         # CSS and styling
│   │   └── types/          # TypeScript definitions
│   └── public/             # Static assets
├── public/                 # Electron main process files
│   ├── electron.js         # Main Electron process
│   ├── preload.js          # Preload script for security
│   └── splash.html         # Splash screen
├── shared/                 # Shared types and constants
└── dist/                  # Built application packages
```

## 🔐 Security Features

- **Context Isolation**: Secure IPC communication between processes
- **CSP Headers**: Content Security Policy protection
- **No Node Integration**: Renderer process runs in secure context
- **Preload Scripts**: Safe API exposure to frontend

## 🎨 UI/UX Features

- **Glassmorphism Design**: Modern glass-like effects
- **Cross-platform Native Feel**: Platform-specific optimizations
- **Custom Titlebar**: Integrated window controls
- **Smooth Animations**: Fluid user interactions
- **Responsive Layout**: Adaptive to different screen sizes

## 📱 Platform-Specific Features

### Windows
- **NSIS Installer**: Professional installation experience
- **Windows notifications**: Native system notifications
- **Jump lists**: Quick access from taskbar

### macOS
- **DMG Packaging**: Standard macOS distribution
- **Vibrancy Effects**: Native glass effects
- **Menu bar integration**: Standard macOS menus

### Linux
- **AppImage Format**: Universal Linux packaging
- **Desktop integration**: System tray and notifications

## 🔧 Development Scripts

```bash
# Development
npm run start              # Start all services with Electron
npm run dev               # Start backend and frontend only
npm run backend:dev       # Start backend with nodemon
npm run frontend:start    # Start React development server
npm run electron:dev      # Start Electron in development mode

# Building
npm run build             # Build both backend and frontend
npm run backend:build     # Build backend TypeScript
npm run frontend:build    # Build React for production

# Packaging
npm run pack             # Package app without creating installer
npm run dist             # Create distributable packages
```

## 🐛 Debugging

### Electron DevTools
- **Main Process**: Use `console.log()` or attach debugger
- **Renderer Process**: Open DevTools with `Ctrl+Shift+I` (dev mode)
- **IPC Communication**: Monitor in DevTools Network tab

### Backend API
- **Logs**: Check console output for API logs
- **Database**: Use PostgreSQL client to inspect data
- **Network**: Use Postman or similar for API testing

## 🚀 Deployment

### Auto-Updates
The app supports automatic updates using `electron-updater`. Configure your update server in the build configuration.

### Distribution
- **Windows**: `.exe` installer and portable `.exe`
- **macOS**: `.dmg` disk image and `.app` bundle
- **Linux**: `.AppImage` and `.deb`/`.rpm` packages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@cruiseplatform.com or create an issue on GitHub.

## 🏗 Roadmap

- [ ] Voice command integration
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] Integration with popular business tools
- [ ] Mobile companion app
- [ ] Advanced AI models integration

---

**Built with ❤️ for entrepreneurs by entrepreneurs**
- Mobile application development.
- Advanced analytics and reporting features.
- Integration with additional external platforms.
- Real-time collaboration capabilities.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.