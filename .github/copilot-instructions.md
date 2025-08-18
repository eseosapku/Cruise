# Cruise Platform Development Guide

## Project Overview
Full-stack AI-powered entrepreneurship accelerator with glassmorphism UI design.

## Architecture
- **Backend**: Node.js/Express with PostgreSQL
- **Frontend**: React 18 with glassmorphism design
- **AI Integration**: OpenAI GPT-4 for conversational AI
- **Features**: Web scraping, LinkedIn outreach, pitch deck generation, meeting assistance

## Development Guidelines

### Code Style
- Use modern ES6+ JavaScript
- Follow React best practices with hooks
- Implement glassmorphism design patterns
- Maintain consistent API patterns

### Component Structure
- Page components in `/pages`
- Reusable components in `/components/modules`
- Common components in `/components/common`
- Custom hooks in `/hooks`

### API Design
- RESTful endpoints under `/api/v1`
- Consistent error handling
- JWT authentication
- Rate limiting enabled

### Database Schema
- PostgreSQL with relational design
- User-centric data model
- JSON fields for flexible data storage
- Proper indexing for performance

## Key Features Implementation

### AI Assistant
- Conversational interface with context awareness
- Voice command support via Web Speech API
- Phase-specific assistance and suggestions
- Integration with OpenAI GPT-4

### Glassmorphism UI
- Backdrop blur effects with CSS `backdrop-filter`
- Semi-transparent backgrounds with proper opacity
- Smooth transitions and hover effects
- Apple-inspired design language

### Web Scraping
- Cheerio for HTML parsing
- Rate-limited requests to prevent blocking
- Structured data extraction and analysis
- Integration with AI for data interpretation

### LinkedIn Integration
- Profile search and analysis
- Automated outreach campaigns
- Message personalization with AI
- Campaign tracking and analytics

### Pitch Deck Builder
- Dynamic slide generation based on research data
- Multiple template options
- AI-powered content creation
- Export capabilities (PDF, PowerPoint)

## Security Considerations
- JWT tokens with proper expiration
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration for cross-origin requests
- Rate limiting to prevent abuse

## Performance Optimization
- Database query optimization with indexes
- Frontend code splitting and lazy loading
- API response caching where appropriate
- Image optimization and CDN usage

## Development Workflow
1. Feature development in separate branches
2. Code review process before merging
3. Automated testing for critical paths
4. Staging environment for integration testing
5. Production deployment with monitoring

## Environment Setup
- Node.js 16+ required
- PostgreSQL database setup
- Environment variables configuration
- API keys for external services (OpenAI, LinkedIn)

## Future Enhancements
- Mobile application development
- Advanced analytics and reporting
- Integration with more external platforms
- Enterprise features and multi-tenancy
- Real-time collaboration features
