# Angel One Trading Dashboard - Architecture Documentation

## Overview

This application implements a **unified server architecture** where a single Node.js server serves both the frontend React application and acts as a secure API proxy for Angel One API calls. This architecture eliminates CORS issues and ensures that sensitive credentials never leave the server.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Dashboard     │  │   GTT Manager   │  │   Holdings  │ │
│  │   Components    │  │   Components    │  │  Components │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Requests
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Node.js Express Server                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Static File   │  │   API Proxy     │  │  Security   │ │
│  │     Server      │  │   Endpoints     │  │  Middleware │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Angel One API Calls
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Angel One SmartAPI                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Authentication│  │   Holdings API  │  │  GTT Orders │ │
│  │   & Session     │  │   & Portfolio   │  │    API      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Key Architectural Decisions

### 1. Unified Server Model
- **Single Server**: One Node.js server handles both frontend serving and API proxying
- **No CORS Issues**: Since frontend and API are served from the same origin
- **Secure Credential Handling**: Angel One credentials are only stored on the server

### 2. Security Architecture
- **Credential Isolation**: Frontend never sees actual API credentials
- **Session Management**: Server maintains Angel One session tokens
- **Rate Limiting**: Built-in protection against API abuse
- **Helmet Security**: Comprehensive security headers

### 3. Frontend Architecture
- **React with Hooks**: Modern functional components with hooks
- **Tailwind CSS**: Utility-first styling with dark mode support
- **Responsive Design**: Mobile-first approach
- **CDN Dependencies**: React, ReactDOM, and Babel loaded from CDN

## Server Implementation

The server (`server.js`) implements the following key features:

### Authentication Flow
1. **Login**: Receives credentials from frontend
2. **TOTP Generation**: Generates time-based one-time password
3. **Checksum Creation**: Creates SHA256 hash for security
4. **Session Storage**: Stores JWT token and session data
5. **API Proxy**: Forwards authenticated requests to Angel One

### API Endpoints
- `POST /api/auth/login` - Authenticate with Angel One
- `POST /api/auth/logout` - End session
- `GET /api/session/status` - Check session status
- `GET /api/holdings` - Fetch holdings data
- `GET /api/portfolio` - Fetch portfolio summary
- `GET /api/gtt/orders` - Fetch GTT orders
- `POST /api/gtt/create` - Create new GTT order
- `GET /api/search/instruments` - Search for instruments

### Security Features
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet**: Security headers and CSP
- **Compression**: Gzip compression for responses
- **Request Logging**: Morgan for request logging

## Frontend Implementation

### Component Structure
```
App
├── LoginForm (Authentication)
├── Sidebar (Navigation)
└── Main Content
    ├── Dashboard (Portfolio Overview)
    ├── GttManager (GTT Orders)
    ├── Holdings (Detailed Holdings)
    ├── History (Historical Data)
    ├── Accounts (Multi-Account Management)
    └── Settings (Watchlist & Preferences)
```

### State Management
- **React Hooks**: useState, useEffect, useCallback
- **Local Storage**: User preferences and watchlist
- **Session State**: Login status and user data

### UI/UX Features
- **Dark/Light Mode**: Persistent theme switching
- **Responsive Design**: Mobile and desktop optimized
- **Loading States**: Spinner and skeleton loading
- **Error Handling**: User-friendly error messages
- **Success Notifications**: Toast-style success messages

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Angel One SmartAPI credentials

### Step 1: Clone and Install Dependencies
```bash
# Clone the repository
git clone <repository-url>
cd angel-one-trading-dashboard

# Install backend dependencies
npm install
```

### Step 2: Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your Angel One credentials
nano .env
```

Fill in your `.env` file with:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Angel One API Configuration
ANGEL_ONE_API_KEY=your_actual_api_key
ANGEL_ONE_CLIENT_CODE=your_actual_client_code
ANGEL_ONE_PIN=your_actual_pin
ANGEL_ONE_TOTP_SECRET=your_actual_totp_secret

# Security Configuration
SESSION_SECRET=your_random_session_secret
ENCRYPTION_KEY=your_random_encryption_key
```

### Step 3: Start the Application
```bash
# Start the server
npm start

# Or for development with auto-restart
npm run dev
```

### Step 4: Access the Application
- Open your browser and navigate to `http://localhost:3000`
- You should see the login screen
- Enter your Angel One credentials to start using the dashboard

## API Integration Details

### Angel One SmartAPI Integration
The server integrates with Angel One's SmartAPI using the following endpoints:

#### Authentication
- **Base URL**: `https://apiconnect.angelbroking.com`
- **Login Endpoint**: `/rest/auth/angelbroking/user/v1/loginByPassword`
- **Required Headers**: 
  - `Content-Type: application/json`
  - `X-UserType: USER`
  - `X-SourceID: WEB`

#### Data Endpoints
- **Holdings**: `/rest/secure/angelbroking/order/v1/getHolding`
- **Portfolio**: `/rest/secure/angelbroking/order/v1/getPosition`
- **GTT Orders**: `/rest/secure/angelbroking/order/v1/getGttOrderList`
- **Create GTT**: `/rest/secure/angelbroking/order/v1/placeGttOrder`
- **Search Instruments**: `/rest/secure/angelbroking/order/v1/searchScrip`

### Session Management
- **JWT Token**: Stored in server memory for API calls
- **Refresh Token**: Available for session renewal
- **Feed Token**: Used for real-time data (future implementation)

## Security Considerations

### Credential Security
- **Server-Only Storage**: Credentials never sent to frontend
- **Environment Variables**: Sensitive data stored in .env file
- **Session Isolation**: Each user session is isolated

### API Security
- **Rate Limiting**: Prevents API abuse
- **Request Validation**: Input sanitization and validation
- **Error Handling**: Secure error messages without exposing internals

### Frontend Security
- **Content Security Policy**: Restricts resource loading
- **XSS Protection**: Input sanitization
- **HTTPS Ready**: Configured for production HTTPS

## Development Workflow

### Adding New Features
1. **Backend**: Add new API endpoints in `server.js`
2. **Frontend**: Create new React components in `public/js/app.js`
3. **Testing**: Test with real Angel One credentials
4. **Documentation**: Update this file with new features

### Debugging
- **Server Logs**: Check console for API errors
- **Browser Console**: Frontend errors and network requests
- **Network Tab**: Monitor API calls and responses

### Production Deployment
1. **Environment**: Set `NODE_ENV=production`
2. **HTTPS**: Configure SSL certificates
3. **Process Manager**: Use PM2 or similar
4. **Monitoring**: Add application monitoring
5. **Backup**: Regular database and configuration backups

## Troubleshooting

### Common Issues

#### Login Failures
- **Invalid Credentials**: Double-check API key, client code, PIN, and TOTP secret
- **Network Issues**: Ensure server can reach Angel One API
- **TOTP Issues**: Verify TOTP secret is correct and time is synchronized

#### API Errors
- **401 Unauthorized**: Session expired, re-login required
- **429 Too Many Requests**: Rate limit exceeded, wait before retrying
- **500 Server Error**: Check server logs for detailed error information

#### Frontend Issues
- **Blank Screen**: Check browser console for JavaScript errors
- **Styling Issues**: Ensure Tailwind CSS is loading properly
- **Mobile Issues**: Test responsive design on different screen sizes

### Performance Optimization
- **Caching**: Implement Redis for session storage
- **Compression**: Enable gzip compression
- **CDN**: Use CDN for static assets in production
- **Database**: Add database for persistent storage

## Future Enhancements

### Planned Features
1. **Real-time Data**: WebSocket integration for live prices
2. **Multi-User Support**: User authentication and profiles
3. **Advanced GTT**: Conditional orders and complex triggers
4. **Portfolio Analytics**: Charts and performance metrics
5. **Mobile App**: React Native version
6. **Alerts**: Price alerts and notifications
7. **Backtesting**: Historical strategy testing
8. **Integration**: Connect with other trading platforms

### Technical Improvements
1. **TypeScript**: Full TypeScript migration
2. **Testing**: Unit and integration tests
3. **CI/CD**: Automated deployment pipeline
4. **Monitoring**: Application performance monitoring
5. **Documentation**: API documentation with Swagger

## Support and Maintenance

### Regular Maintenance
- **Security Updates**: Keep dependencies updated
- **API Changes**: Monitor Angel One API changes
- **Performance**: Regular performance audits
- **Backup**: Regular data and configuration backups

### User Support
- **Documentation**: Keep setup instructions updated
- **Troubleshooting**: Maintain common issues list
- **Updates**: Regular feature updates and bug fixes

---

This architecture provides a solid foundation for a secure, scalable, and user-friendly Angel One trading dashboard. The unified server model ensures security while providing excellent user experience.